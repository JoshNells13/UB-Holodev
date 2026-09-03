import type { Crop } from '~/types/crop'
import type { ClimateSummary } from '~/types/weather'
import type { PlantingWindowRecommendation, PlantingWindowDay } from '~/types/risk'
import type { ScenarioResult, PortfolioAllocation, PortfolioSimulationResult } from '~/types/simulation'
import { RiskEngine } from './risk.service'

export class DecisionEngine {
  /**
   * Generates optimal planting window scanning +/- 30 days around selected date
   */
  static calculatePlantingWindow(
    crop: Crop,
    centerDateStr: string,
    climate: ClimateSummary,
    landArea = 1000,
    hasIrrigation = true
  ): PlantingWindowRecommendation {
    const centerDate = new Date(centerDateStr)
    const days: PlantingWindowDay[] = []

    let maxScore = -1
    let optimalDateStr = centerDateStr

    // Scan +/- 28 days with 7-day or 4-day increments (total 15 sampled dates)
    for (let offset = -28; offset <= 28; offset += 4) {
      const d = new Date(centerDate.getTime() + offset * 24 * 60 * 60 * 1000)
      const dateStr = d.toISOString().split('T')[0]
      const riskBreakdown = RiskEngine.analyze(crop, dateStr, climate, landArea, hasIrrigation)

      const isOptimal = false
      if (riskBreakdown.total_score > maxScore) {
        maxScore = riskBreakdown.total_score
        optimalDateStr = dateStr
      }

      days.push({
        date: dateStr,
        score: riskBreakdown.total_score,
        risk_level: riskBreakdown.weather_risk.risk_level,
        recommendation: riskBreakdown.recommendation,
        is_optimal: isOptimal
      })
    }

    // Mark the optimal day
    days.forEach(d => {
      if (d.date === optimalDateStr) {
        d.is_optimal = true
      }
    })

    // Compute window range (startDate to endDate around peak)
    const optimalIndex = days.findIndex(d => d.date === optimalDateStr)
    const startIndex = Math.max(0, optimalIndex - 1)
    const endIndex = Math.min(days.length - 1, optimalIndex + 1)

    const optRiskBreakdown = RiskEngine.analyze(crop, optimalDateStr, climate, landArea, hasIrrigation)

    return {
      startDate: days[startIndex].date,
      endDate: days[endIndex].date,
      optimalDate: optimalDateStr,
      riskLevel: optRiskBreakdown.weather_risk.risk_level,
      confidence: maxScore >= 80 ? 'HIGH' : maxScore >= 65 ? 'MEDIUM' : 'LOW',
      days
    }
  }

  /**
   * Evaluates and compares multiple scenarios to pick the best decision
   */
  static evaluateScenarios(scenarios: ScenarioResult[]): { bestScenarioId: string; comparisonNotes: string[] } {
    if (scenarios.length === 0) {
      return { bestScenarioId: '', comparisonNotes: [] }
    }

    let bestScenario = scenarios[0]
    let highestScore = bestScenario.risk_breakdown.total_score

    for (const sc of scenarios) {
      if (sc.risk_breakdown.total_score > highestScore) {
        highestScore = sc.risk_breakdown.total_score
        bestScenario = sc
      }
    }

    const notes: string[] = []
    notes.push(`Skenario terbaik: **${bestScenario.crop.name}** pada tanggal **${bestScenario.planting_date}** dengan Skor **${bestScenario.risk_breakdown.total_score}/100** (${bestScenario.risk_breakdown.recommendation}).`)

    if (scenarios.length > 1) {
      const baseline = scenarios.find(s => s.is_baseline) || scenarios[0]
      if (bestScenario.id !== baseline.id) {
        const diff = bestScenario.risk_breakdown.total_score - baseline.risk_breakdown.total_score
        notes.push(`Mengalihkan keputusan dari baseline (${baseline.crop.name} - ${baseline.planting_date}) ke skenario rekomendasi memberikan peningkatan performa sebesar **+${diff.toFixed(1)} poin** dengan penurunan tingkat risiko cuaca/air.`)
      }
    }

    return {
      bestScenarioId: bestScenario.id,
      comparisonNotes: notes
    }
  }

  /**
   * Multi-crop Portfolio Diversification Simulator
   */
  static simulatePortfolio(
    allocations: { crop: Crop; percentage: number }[],
    plantingDateStr: string,
    climate: ClimateSummary,
    totalArea = 10000
  ): PortfolioSimulationResult {
    let weightedScore = 0
    let totalWaterDemand = 0
    const portfolioAllocations: PortfolioAllocation[] = []

    for (const item of allocations) {
      const allocatedArea = (item.percentage / 100) * totalArea
      const risk = RiskEngine.analyze(item.crop, plantingDateStr, climate, allocatedArea)
      const waterPerM2 = (item.crop.water_requirement_mm / 1000) // m³ per m²
      const cropWaterM3 = waterPerM2 * allocatedArea

      weightedScore += (risk.total_score * (item.percentage / 100))
      totalWaterDemand += cropWaterM3

      portfolioAllocations.push({
        crop_slug: item.crop.slug,
        crop_name: item.crop.name,
        percentage: item.percentage,
        allocated_area_m2: allocatedArea,
        individual_score: risk.total_score,
        risk_contribution: (100 - risk.total_score) * (item.percentage / 100)
      })
    }

    // Herfindahl-Hirschman Index based diversification score
    const hhi = allocations.reduce((acc, curr) => acc + Math.pow(curr.percentage, 2), 0) // 10000 = monoculture, ~3333 = 3 equal crops
    const diversificationIndex = Math.round(Math.max(0, 100 - (hhi / 100)))

    // Risk reduction benefit percentage (compared to worst monoculture)
    const monocultureScores = portfolioAllocations.map(a => a.individual_score)
    const minMonoculture = Math.min(...monocultureScores)
    const riskReductionBenefit = Math.max(0, Math.round(((weightedScore - minMonoculture) / (minMonoculture || 1)) * 100))

    return {
      allocations: portfolioAllocations,
      weighted_total_score: Math.round(weightedScore * 10) / 10,
      diversificationIndex,
      composite_weather_risk: weightedScore >= 75 ? 'LOW' : weightedScore >= 55 ? 'MEDIUM' : 'HIGH',
      composite_water_demand_total_m3: Math.round(totalWaterDemand),
      risk_reduction_benefit_pct: riskReductionBenefit,
      recommendation_note: `Alokasi portofolio menghasilkan diversifikasi indeks ${diversificationIndex}/100, mendistribusikan risiko cekaman iklim dan menyeimbangkan kebutuhan air lahan.`
    }
  }
}
