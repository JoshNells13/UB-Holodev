import type { Crop } from '~/types/crop'
import type { ClimateSummary } from '~/types/weather'
import type { RiskBreakdown, RiskFactorDetail, RiskLevel, RecommendationStatus } from '~/types/risk'

export class RiskEngine {
  static analyze(
    crop: Crop,
    plantingDateStr: string,
    climate: ClimateSummary,
    landArea = 1000,
    hasIrrigation = true
  ): RiskBreakdown {
    const plantingDate = new Date(plantingDateStr)
    const plantMonth = plantingDate.getMonth() // 0 to 11
    const avgGrowthDays = Math.round((crop.growth_days_min + crop.growth_days_max) / 2)
    const harvestDate = new Date(plantingDate.getTime() + avgGrowthDays * 24 * 60 * 60 * 1000)
    const harvestMonth = harvestDate.getMonth()

    // 1. Calculate Weather Risk
    const weatherRisk = this.calculateWeatherRisk(crop, plantMonth, harvestMonth, climate)

    // 2. Calculate Water Risk
    const waterRisk = this.calculateWaterRisk(crop, plantMonth, harvestMonth, climate, hasIrrigation)

    // 3. Calculate Crop Suitability Risk
    const cropSuitabilityRisk = this.calculateCropSuitabilityRisk(crop, plantMonth, harvestMonth, climate)

    // 4. Calculate Economic Risk
    const economicRisk = this.calculateEconomicRisk(crop, landArea, waterRisk.score, weatherRisk.score)

    // 5. Calculate Final Score (0 - 100)
    // Formula from PRD: Weather (30%), Water (25%), Crop (25%), Economic (20%)
    const weatherScore = weatherRisk.score
    const waterScore = waterRisk.score
    const cropScore = cropSuitabilityRisk.score
    const economicScore = economicRisk.score

    const rawTotal = (weatherScore * 0.30) + (waterScore * 0.25) + (cropScore * 0.25) + (economicScore * 0.20)
    const totalScore = Math.min(100, Math.max(0, Math.round(rawTotal * 10) / 10))

    // 6. Recommendation Classification
    let recommendation: RecommendationStatus = 'High Risk'
    if (totalScore >= 80) {
      recommendation = 'Highly Recommended'
    } else if (totalScore >= 65) {
      recommendation = 'Recommended'
    } else if (totalScore >= 50) {
      recommendation = 'Consider Carefully'
    } else {
      recommendation = 'High Risk'
    }

    // 7. Generate Explainable Reasons
    const bulletReasons: string[] = []
    
    if (weatherRisk.risk_level === 'LOW') {
      bulletReasons.push(`Temperatur rata-rata (${climate.historical_monthly_temp[plantMonth].toFixed(1)}°C) berada dalam rentang optimal tanaman (${crop.optimal_temp_min}–${crop.optimal_temp_max}°C).`)
    } else if (weatherRisk.risk_level === 'HIGH') {
      bulletReasons.push(`Potensi fluktuasi suhu dan anomali cuaca dapat menekan fase vegetatif awal.`)
    }

    if (waterRisk.risk_level === 'LOW') {
      bulletReasons.push(`Estimasi ketersediaan air dan curah hujan sangat mencukupi kebutuhan air ${crop.name} (${crop.water_requirement_mm} mm).`)
    } else if (waterRisk.risk_level === 'HIGH') {
      bulletReasons.push(`Risiko defisit/kelebihan air tinggi pada bulan ke-${plantMonth + 1}, membutuhkan manajemen irigasi dan drainase ketat.`)
    }

    if (cropSuitabilityRisk.risk_level === 'LOW') {
      bulletReasons.push(`Fase panen jatuh pada bulan ${this.getMonthName(harvestMonth)} yang memiliki iklim kondusif untuk pengeringan/panen.`)
    }

    if (economicRisk.risk_level === 'LOW') {
      bulletReasons.push(`Stabilitas harga komoditas ${crop.name} (Rp ${crop.market_price_baseline.toLocaleString('id-ID')}/kg) memberikan kepastian margin ekonomi.`)
    } else if (economicRisk.risk_level === 'HIGH') {
      bulletReasons.push(`Komoditas ini memiliki volatilitas harga musiman tinggi di pasar regional.`)
    }

    const summaryReason = totalScore >= 75
      ? `Kombinasi agroklimat dan waktu tanam sangat menguntungkan untuk ${crop.name}. Risiko cekaman cuaca dan defisit air berada pada level minimal.`
      : totalScore >= 55
      ? `Penanaman ${crop.name} layak dilakukan dengan mitigasi risiko irigasi dan pemantauan dinamika cuaca harian.`
      : `Penanaman ${crop.name} pada tanggal ini memiliki risiko kegagalan panen signifikan akibat ketidakcocokan pola curah hujan/suhu.`

    return {
      weather_risk: weatherRisk,
      water_risk: waterRisk,
      crop_suitability_risk: cropSuitabilityRisk,
      economic_risk: economicRisk,
      total_score: totalScore,
      recommendation,
      summary_reason: summaryReason,
      bullet_reasons: bulletReasons
    }
  }

  private static calculateWeatherRisk(
    crop: Crop,
    plantMonth: number,
    harvestMonth: number,
    climate: ClimateSummary
  ): RiskFactorDetail {
    const avgTemp = (climate.historical_monthly_temp[plantMonth] + climate.historical_monthly_temp[harvestMonth]) / 2
    let riskPoints = 15 // base baseline

    // Temp bounds check
    if (avgTemp >= crop.optimal_temp_min && avgTemp <= crop.optimal_temp_max) {
      riskPoints += 5
    } else if (avgTemp < crop.optimal_temp_min - 3 || avgTemp > crop.optimal_temp_max + 3) {
      riskPoints += 55
    } else {
      riskPoints += 28
    }

    // Current forecast volatility check
    if (climate.daily_forecast.length > 0) {
      const maxPrecip = Math.max(...climate.daily_forecast.map(f => f.precipitation_sum))
      if (maxPrecip > 60) riskPoints += 15 // Extreme rain storm
    }

    riskPoints = Math.min(100, Math.max(5, riskPoints))
    const score = 100 - riskPoints
    const riskLevel = this.classifyRisk(riskPoints)

    return {
      score,
      risk_level: riskLevel,
      risk_percentage: riskPoints,
      title: 'Weather Risk',
      description: `Analisis deviasi temperatur (${avgTemp.toFixed(1)}°C) dan potensi cuaca ekstrem selama periode tanam.`,
      insights: [
        `Rentang temperatur optimal: ${crop.optimal_temp_min}°C – ${crop.optimal_temp_max}°C`,
        `Temperatur lingkungan rata-rata: ${avgTemp.toFixed(1)}°C`,
        `Status risiko cuaca: ${riskLevel}`
      ]
    }
  }

  private static calculateWaterRisk(
    crop: Crop,
    plantMonth: number,
    harvestMonth: number,
    climate: ClimateSummary,
    hasIrrigation: boolean
  ): RiskFactorDetail {
    // Total estimated rainfall during growing season
    let seasonalRainfall = 0
    let m = plantMonth
    const durationMonths = Math.max(2, Math.ceil(crop.growth_days_max / 30))
    for (let i = 0; i < durationMonths; i++) {
      seasonalRainfall += climate.historical_monthly_rainfall[(m + i) % 12]
    }

    let riskPoints = 10
    const waterNeed = crop.water_requirement_mm

    if (seasonalRainfall < waterNeed * 0.5) {
      // Severe drought risk
      riskPoints += hasIrrigation ? 30 : 65
    } else if (seasonalRainfall < waterNeed * 0.8) {
      // Mild drought risk
      riskPoints += hasIrrigation ? 15 : 40
    } else if (seasonalRainfall > waterNeed * 2.2) {
      // Flood / waterlogging risk (especially bad for shallots/chili/legumes)
      if (crop.slug === 'bawang-merah' || crop.slug === 'cabai-merah') {
        riskPoints += 55
      } else {
        riskPoints += 25
      }
    } else {
      // Optimal water balance
      riskPoints += 8
    }

    riskPoints = Math.min(100, Math.max(5, riskPoints))
    const score = 100 - riskPoints
    const riskLevel = this.classifyRisk(riskPoints)

    return {
      score,
      risk_level: riskLevel,
      risk_percentage: riskPoints,
      title: 'Water Risk',
      description: `Keseimbangan antara kebutuhan air tanaman (${waterNeed} mm) dengan estimasi curah hujan akumulatif (${seasonalRainfall.toFixed(0)} mm).`,
      insights: [
        `Kebutuhan air tanaman: ${waterNeed} mm/musim (${crop.water_requirement})`,
        `Proyeksi curah hujan periode tanam: ${seasonalRainfall.toFixed(0)} mm`,
        `Akses irigasi: ${hasIrrigation ? 'Tersedia' : 'Tadah Hujan'}`,
        `Status risiko air: ${riskLevel}`
      ]
    }
  }

  private static calculateCropSuitabilityRisk(
    crop: Crop,
    plantMonth: number,
    harvestMonth: number,
    climate: ClimateSummary
  ): RiskFactorDetail {
    let riskPoints = 12

    // Check specific agroclimatic rules
    // E.g., Potato needs cold highland (optimal max < 24°C)
    const plantTemp = climate.historical_monthly_temp[plantMonth]
    if (crop.slug === 'kentang' && plantTemp > 24) {
      riskPoints += 60 // Highland mismatch
    }

    // Shallots during heavy rain month
    const harvestRainfall = climate.historical_monthly_rainfall[harvestMonth]
    if (crop.slug === 'bawang-merah' && harvestRainfall > 220) {
      riskPoints += 45 // Post-harvest rot risk
    }

    // Rice loves wet months
    if (crop.slug === 'padi' && harvestRainfall >= 140) {
      riskPoints = Math.max(5, riskPoints - 10)
    }

    // Corn post-rice dry rotation
    if (crop.slug === 'jagung' && harvestRainfall < 180 && harvestRainfall > 60) {
      riskPoints = Math.max(5, riskPoints - 8)
    }

    riskPoints = Math.min(100, Math.max(5, riskPoints))
    const score = 100 - riskPoints
    const riskLevel = this.classifyRisk(riskPoints)

    return {
      score,
      risk_level: riskLevel,
      risk_percentage: riskPoints,
      title: 'Crop Suitability Risk',
      description: `Kesesuaian agroklimat varietas ${crop.name} terhadap siklus agroklimat wilayah.`,
      insights: [
        `Durasi pertumbuhan: ${crop.growth_days_min} – ${crop.growth_days_max} hari`,
        `Bulan perkiraan panen: ${this.getMonthName(harvestMonth)}`,
        `Kesesuaian agronomis: ${riskLevel === 'LOW' ? 'Sangat Sesuai' : riskLevel === 'MEDIUM' ? 'Cukup Sesuai' : 'Kurang Sesuai'}`
      ]
    }
  }

  private static calculateEconomicRisk(
    crop: Crop,
    landArea: number,
    waterScore: number,
    weatherScore: number
  ): RiskFactorDetail {
    let riskPoints = 20

    // Commodity volatility baseline
    if (crop.slug === 'cabai-merah' || crop.slug === 'bawang-merah') {
      riskPoints += 25 // High price volatility
    } else if (crop.slug === 'padi' || crop.slug === 'jagung') {
      riskPoints += 8 // Stable national staple floor price
    } else {
      riskPoints += 15
    }

    // Compound with agroclimatic risk (if weather/water is risky, economic loss exposure spikes)
    const agroRisk = (200 - (waterScore + weatherScore)) / 2
    if (agroRisk > 50) {
      riskPoints += 25
    }

    riskPoints = Math.min(100, Math.max(5, riskPoints))
    const score = 100 - riskPoints
    const riskLevel = this.classifyRisk(riskPoints)

    return {
      score,
      risk_level: riskLevel,
      risk_percentage: riskPoints,
      title: 'Economic Risk',
      description: `Evaluasi volatilitas harga pasar dan potensi imbal hasil investasi lahan ${landArea.toLocaleString('id-ID')} m².`,
      insights: [
        `Estimasi harga acuan: Rp ${crop.market_price_baseline.toLocaleString('id-ID')} / kg`,
        `Volatilitas komoditas: ${crop.slug === 'cabai-merah' || crop.slug === 'bawang-merah' ? 'Tinggi (Hortikultura)' : 'Rendah - Moderat (Pangan Pokok)'}`,
        `Tingkat risiko finansial: ${riskLevel}`
      ]
    }
  }

  static classifyRisk(points: number): RiskLevel {
    if (points <= 30) return 'LOW'
    if (points <= 60) return 'MEDIUM'
    return 'HIGH'
  }

  private static getMonthName(m: number): string {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    return months[m % 12]
  }
}
