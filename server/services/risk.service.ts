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
    const weatherRisk = this.calculateWeatherRisk(crop, plantingDate, plantMonth, harvestMonth, climate)

    // 2. Calculate Water Risk
    const waterRisk = this.calculateWaterRisk(crop, plantMonth, harvestMonth, climate, hasIrrigation)

    // 3. Calculate Crop Suitability Risk
    const cropSuitabilityRisk = this.calculateCropSuitabilityRisk(crop, plantMonth, harvestMonth, climate)

    // 4. Calculate Economic Risk
    const economicRisk = this.calculateEconomicRisk(crop, landArea, waterRisk.score, weatherRisk.score)

    // 5. Calculate Final Score (0 - 100)
    // Formula: Weather (30%), Water (25%), Crop Suitability (25%), Economic (20%)
    const weatherScore = weatherRisk.score
    const waterScore = waterRisk.score
    const cropScore = cropSuitabilityRisk.score
    const economicScore = economicRisk.score

    const rawTotal = (weatherScore * 0.30) + (waterScore * 0.25) + (cropScore * 0.25) + (economicScore * 0.20)
    const totalScore = Math.min(100, Math.max(5, Math.round(rawTotal * 10) / 10))

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
    
    const plantTemp = climate.historical_monthly_temp[plantMonth] ?? climate.current_temp
    if (weatherRisk.risk_level === 'LOW') {
      bulletReasons.push(`Suhu rata-rata wilayah (${plantTemp.toFixed(1)}°C) berada dalam rentang ideal budidaya ${crop.name} (${crop.optimal_temp_min}–${crop.optimal_temp_max}°C).`)
    } else if (weatherRisk.risk_level === 'HIGH') {
      bulletReasons.push(`Deviasi suhu (${plantTemp.toFixed(1)}°C) dan dinamika cuaca ekstrem berpotensi menghambat pertumbuhan vegetatif.`)
    } else {
      bulletReasons.push(`Kondisi termal (${plantTemp.toFixed(1)}°C) cukup memadai dengan pemantauan suhu harian.`)
    }

    if (waterRisk.risk_level === 'LOW') {
      bulletReasons.push(`Ketersediaan pasokan air (${hasIrrigation ? 'Irigasi Teknis + ' : ''}curah hujan) sangat mencukupi kebutuhan air ${crop.name} (${crop.water_requirement_mm} mm).`)
    } else if (waterRisk.risk_level === 'HIGH') {
      bulletReasons.push(`Risiko defisit/kelebihan air tinggi pada fase generatif, memerlukan intervensi drainase atau pompa air aktif.`)
    } else {
      bulletReasons.push(`Neraca air berada pada level moderat, disarankan pengaturan jadwal siram teratur.`)
    }

    if (cropSuitabilityRisk.risk_level === 'LOW') {
      bulletReasons.push(`Waktu panen (${this.getMonthName(harvestMonth)}) memiliki agroklimat kering/kondusif untuk pematangan dan panen maksimal.`)
    } else if (cropSuitabilityRisk.risk_level === 'HIGH') {
      bulletReasons.push(`Karakteristik varietas ${crop.name} kurang selaras dengan kondisi musim di bulan ${this.getMonthName(plantMonth)}–${this.getMonthName(harvestMonth)}.`)
    }

    if (economicRisk.risk_level === 'LOW') {
      bulletReasons.push(`Estimasi margin pendapatan pada lahan ${(landArea / 10000).toFixed(2)} Ha stabil dengan harga pasar Rp ${crop.market_price_baseline.toLocaleString('id-ID')}/kg.`)
    } else if (economicRisk.risk_level === 'HIGH') {
      bulletReasons.push(`Paparan risiko agroklimat berpotensi menekan ROI investasi budidaya.`)
    }

    const summaryReason = totalScore >= 78
      ? `Agroklimat di ${climate.location_name} sangat kondusif untuk ${crop.name}. Tingkat risiko cekaman cuaca dan defisit air minimal.`
      : totalScore >= 60
      ? `Penanaman ${crop.name} layak direalisasikan dengan manajemen irigasi tepat dan mitigasi cuaca harian.`
      : `Penanaman ${crop.name} pada periode ini memiliki risiko tinggi. Disarankan penyesuaian jadwal tanam atau penyiapan fasilitas irigasi teknis.`

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
    plantingDate: Date,
    plantMonth: number,
    harvestMonth: number,
    climate: ClimateSummary
  ): RiskFactorDetail {
    const plantTemp = climate.historical_monthly_temp[plantMonth] ?? climate.current_temp
    const harvestTemp = climate.historical_monthly_temp[harvestMonth] ?? climate.current_temp
    const avgTemp = (plantTemp + harvestTemp) / 2
    let riskPoints = 12

    // 1. Temperature Range Bounds
    if (avgTemp >= crop.optimal_temp_min && avgTemp <= crop.optimal_temp_max) {
      riskPoints += 4 // Optimal
    } else if (avgTemp < crop.optimal_temp_min) {
      const diff = crop.optimal_temp_min - avgTemp
      riskPoints += Math.min(50, Math.round(diff * 8)) // Cold shock
    } else {
      const diff = avgTemp - crop.optimal_temp_max
      riskPoints += Math.min(50, Math.round(diff * 7)) // Heat shock
    }

    // 2. Real-time Near-term 16-day forecast check
    if (climate.daily_forecast && climate.daily_forecast.length > 0) {
      const now = new Date()
      const diffDays = Math.round((plantingDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
      
      // If planting is within the 16-day forecast window, incorporate real forecast anomalies
      if (diffDays >= 0 && diffDays < climate.daily_forecast.length) {
        const forecastWindow = climate.daily_forecast.slice(Math.max(0, diffDays), Math.min(climate.daily_forecast.length, diffDays + 5))
        
        // Check for extreme rain storm in planting week
        const maxPrecip = Math.max(...forecastWindow.map(f => f.precipitation_sum))
        if (maxPrecip > 50) riskPoints += 18 // Severe torrential storm
        else if (maxPrecip > 30) riskPoints += 10 // Heavy rain

        // Check for high wind
        const maxWind = Math.max(...forecastWindow.map(f => f.wind_speed_max || 0))
        if (maxWind > 25) riskPoints += 10

        // Check for heat wave
        const maxDayTemp = Math.max(...forecastWindow.map(f => f.temp_max))
        if (maxDayTemp > 35) riskPoints += 12
      }
    }

    riskPoints = Math.min(95, Math.max(5, riskPoints))
    const score = 100 - riskPoints
    const riskLevel = this.classifyRisk(riskPoints)

    return {
      score,
      risk_level: riskLevel,
      risk_percentage: riskPoints,
      title: 'Weather Risk',
      description: `Evaluasi deviasi suhu rata-rata (${avgTemp.toFixed(1)}°C) dan prakiraan cuaca ekstrem Open-Meteo pada periode tanam.`,
      insights: [
        `Rentang temperatur optimal ${crop.name}: ${crop.optimal_temp_min}°C – ${crop.optimal_temp_max}°C`,
        `Temperatur lingkungan rata-rata: ${avgTemp.toFixed(1)}°C (Saat ini: ${climate.current_temp}°C)`,
        `Deskripsi cuaca lokal terkini: ${climate.current_weather_desc}`,
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
      seasonalRainfall += (climate.historical_monthly_rainfall[(m + i) % 12] ?? 180)
    }

    let riskPoints = 10
    const waterNeed = crop.water_requirement_mm

    if (seasonalRainfall < waterNeed * 0.4) {
      // Severe drought risk
      riskPoints += hasIrrigation ? 25 : 65
    } else if (seasonalRainfall < waterNeed * 0.75) {
      // Mild water deficit
      riskPoints += hasIrrigation ? 12 : 38
    } else if (seasonalRainfall > waterNeed * 2.2) {
      // Flood / waterlogging risk (especially sensitive: shallot, chili, legumes)
      if (crop.slug === 'bawang-merah' || crop.slug === 'cabai-merah') {
        riskPoints += 50
      } else {
        riskPoints += 24
      }
    } else {
      // Optimal water balance
      riskPoints += 6
    }

    riskPoints = Math.min(95, Math.max(5, riskPoints))
    const score = 100 - riskPoints
    const riskLevel = this.classifyRisk(riskPoints)

    return {
      score,
      risk_level: riskLevel,
      risk_percentage: riskPoints,
      title: 'Water Risk',
      description: `Keseimbangan antara kebutuhan air tanaman (${waterNeed} mm) dengan akumulasi curah hujan (${seasonalRainfall.toFixed(0)} mm).`,
      insights: [
        `Kebutuhan air tanaman: ${waterNeed} mm (${crop.water_requirement})`,
        `Proyeksi curah hujan periode tanam: ${seasonalRainfall.toFixed(0)} mm`,
        `Akses irigasi: ${hasIrrigation ? 'Irigasi Teknis Tersedia' : 'Lahan Tadah Hujan'}`,
        `Status risiko ketersediaan air: ${riskLevel}`
      ]
    }
  }

  private static calculateCropSuitabilityRisk(
    crop: Crop,
    plantMonth: number,
    harvestMonth: number,
    climate: ClimateSummary
  ): RiskFactorDetail {
    let riskPoints = 10

    const plantTemp = climate.historical_monthly_temp[plantMonth] ?? climate.current_temp
    const harvestRainfall = climate.historical_monthly_rainfall[harvestMonth] ?? 150

    // Specific agroclimatic rules per crop
    if (crop.slug === 'kentang' && plantTemp > 24) {
      // Highland crop in warm lowland
      riskPoints += Math.min(60, Math.round((plantTemp - 24) * 12))
    }

    if ((crop.slug === 'bawang-merah' || crop.slug === 'cabai-merah') && harvestRainfall > 220) {
      // Post-harvest fungal decay in excessive rain
      riskPoints += 40
    }

    if (crop.slug === 'padi' && harvestRainfall >= 140) {
      // Wetland rice thrives with wet season
      riskPoints = Math.max(5, riskPoints - 8)
    }

    if (crop.slug === 'jagung' && harvestRainfall < 190 && harvestRainfall > 50) {
      // Corn thrives in moderate moisture
      riskPoints = Math.max(5, riskPoints - 6)
    }

    riskPoints = Math.min(95, Math.max(5, riskPoints))
    const score = 100 - riskPoints
    const riskLevel = this.classifyRisk(riskPoints)

    return {
      score,
      risk_level: riskLevel,
      risk_percentage: riskPoints,
      title: 'Crop Suitability Risk',
      description: `Kesesuaian agroklimat komoditas ${crop.name} terhadap siklus musim wilayah.`,
      insights: [
        `Siklus budidaya: ${crop.growth_days_min} – ${crop.growth_days_max} hari`,
        `Estimasi waktu panen: Bulan ${this.getMonthName(harvestMonth)}`,
        `Tingkat kesesuaian agronomis: ${riskLevel === 'LOW' ? 'Sangat Sesuai' : riskLevel === 'MEDIUM' ? 'Cukup Sesuai' : 'Perlu Mitigasi Khusus'}`
      ]
    }
  }

  private static calculateEconomicRisk(
    crop: Crop,
    landArea: number,
    waterScore: number,
    weatherScore: number
  ): RiskFactorDetail {
    let riskPoints = 18

    // Baseline commodity price volatility
    if (crop.slug === 'cabai-merah' || crop.slug === 'bawang-merah') {
      riskPoints += 22 // High horticultural price volatility
    } else if (crop.slug === 'padi' || crop.slug === 'jagung') {
      riskPoints += 6 // Government floor price stability
    } else {
      riskPoints += 12
    }

    // Compound climate-risk exposure: if weather/water is unfavorable, financial loss exposure increases
    const agroDeficit = Math.max(0, 160 - (waterScore + weatherScore))
    riskPoints += Math.round(agroDeficit * 0.25)

    riskPoints = Math.min(95, Math.max(5, riskPoints))
    const score = 100 - riskPoints
    const riskLevel = this.classifyRisk(riskPoints)

    return {
      score,
      risk_level: riskLevel,
      risk_percentage: riskPoints,
      title: 'Economic Risk',
      description: `Evaluasi volatilitas harga pasar dan potensi imbal hasil investasi pada lahan ${landArea.toLocaleString('id-ID')} m².`,
      insights: [
        `Harga acuan pasar: Rp ${crop.market_price_baseline.toLocaleString('id-ID')} / kg`,
        `Karakteristik komoditas: ${crop.slug === 'cabai-merah' || crop.slug === 'bawang-merah' ? 'Hortikultura (Volatilitas Tinggi)' : 'Pangan Pokok (Harga Acuan Stabil)'}`,
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

