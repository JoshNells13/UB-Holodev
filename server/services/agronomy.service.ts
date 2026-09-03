import type { Crop } from '~/types/crop'
import type { ClimateSummary } from '~/types/weather'
import type { DetailedAgronomyPlan } from '~/types/agronomy'

export class AgronomyService {
  static generateDetailedPlan(
    crop: Crop,
    plantingDateStr: string,
    climate: ClimateSummary,
    landArea = 1000,
    hasIrrigation = true,
    riskScore = 80
  ): DetailedAgronomyPlan {
    const areaHa = landArea / 10000
    const duration = Math.round((crop.growth_days_min + crop.growth_days_max) / 2)
    const plantDate = new Date(plantingDateStr)
    const plantMonth = plantDate.getMonth()

    // 1. Lifecycle Stages
    const stages = this.buildLifecycleStages(crop, duration)

    // 2. Soil Water Balance Calculation
    let seasonalRain = 0
    const durationMonths = Math.max(2, Math.ceil(duration / 30))
    for (let i = 0; i < durationMonths; i++) {
      seasonalRain += (climate.historical_monthly_rainfall[(plantMonth + i) % 12] ?? 180)
    }

    const cropWaterNeed = crop.water_requirement_mm
    const deficitMm = Math.max(0, cropWaterNeed - seasonalRain)
    const irrigationM3 = (deficitMm / 1000) * landArea * (hasIrrigation ? 1.0 : 0.3)

    const weeklySchedule = []
    const totalWeeks = Math.ceil(duration / 7)
    for (let w = 1; w <= Math.min(16, totalWeeks); w++) {
      const isCritical = w >= Math.round(totalWeeks * 0.4) && w <= Math.round(totalWeeks * 0.75) // Flowering & fruit-filling
      const stageM3 = (irrigationM3 / totalWeeks) * (isCritical ? 1.6 : 0.7)
      weeklySchedule.push({
        week: w,
        days: `HST ${((w - 1) * 7) + 1}–${w * 7}`,
        amount_m3: Number(Math.max(0, stageM3).toFixed(1)),
        note: isCritical
          ? 'Fase kritis pembungaan/pengisian: Kelembapan tanah wajib dijaga kapasitas lapang'
          : 'Fase vegetatif: Pengairan moderat terjadwal'
      })
    }

    const waterBalanceStatus: 'Surplus' | 'Optimal Balance' | 'Deficit / Cekaman Air' =
      seasonalRain >= cropWaterNeed * 1.2
        ? 'Surplus'
        : seasonalRain >= cropWaterNeed * 0.75 || hasIrrigation
        ? 'Optimal Balance'
        : 'Deficit / Cekaman Air'

    const waterBalance = {
      total_crop_water_need_mm: cropWaterNeed,
      total_projected_rainfall_mm: Math.round(seasonalRain),
      water_balance_status: waterBalanceStatus,
      irrigation_needed_m3: Math.round(irrigationM3),
      weekly_irrigation_schedule: weeklySchedule
    }

    // 3. Dynamic Financial Projections
    // Benchmark potential yields per Ha in Indonesia (BPS & Balitbangtan Kementan)
    const basePotentialYields: Record<string, number> = {
      'padi': 6.5,
      'jagung': 7.8,
      'kedelai': 2.0,
      'bawang-merah': 11.2,
      'cabai-merah': 8.5,
      'kentang': 18.5,
      'tomat': 22.0,
      'kacang-tanah': 2.3
    }
    const baseYield = basePotentialYields[crop.slug] || 6.0

    // Dynamic Yield Modifier based on Agroclimatic Risk Score (DSS)
    // High DSS score (80+) -> 95-105% of potential yield
    // Moderate DSS score (65-79) -> 85-95%
    // Lower score (< 65) -> 55-80% due to climatic/water stress
    let yieldFactor = 1.0
    if (riskScore >= 80) {
      yieldFactor = 0.95 + ((riskScore - 80) / 20) * 0.10 // 0.95 to 1.05
    } else if (riskScore >= 65) {
      yieldFactor = 0.82 + ((riskScore - 65) / 15) * 0.13 // 0.82 to 0.95
    } else if (riskScore >= 50) {
      yieldFactor = 0.65 + ((riskScore - 50) / 15) * 0.17 // 0.65 to 0.82
    } else {
      yieldFactor = Math.max(0.40, 0.45 + (riskScore / 50) * 0.20) // 0.40 to 0.65
    }

    const yieldPerHa = Number((baseYield * yieldFactor).toFixed(2))
    const totalProductionKg = Math.max(1, Math.round(yieldPerHa * 1000 * areaHa))
    const grossRevenue = Math.round(totalProductionKg * crop.market_price_baseline)

    // Cost estimation scaled proportionally to land area
    const baseSeedsCost = crop.slug === 'bawang-merah' ? 12000000 : crop.slug === 'kentang' ? 10000000 : crop.slug === 'cabai-merah' ? 4500000 : 2200000
    const seedsCost = Math.round(baseSeedsCost * areaHa)
    const fertilizerCost = Math.round((crop.slug === 'padi' ? 3600000 : 4200000) * areaHa)
    const laborCost = Math.round(5000000 * areaHa)
    const waterCost = hasIrrigation ? Math.round(1500000 * areaHa) : Math.round(400000 * areaHa)
    const totalCost = seedsCost + fertilizerCost + laborCost + waterCost
    const netProfit = grossRevenue - totalCost
    const roi = totalCost > 0 ? Math.round((netProfit / totalCost) * 100) : 0

    const financial = {
      estimated_yield_ton_per_ha: yieldPerHa,
      total_production_kg: totalProductionKg,
      market_price_per_kg: crop.market_price_baseline,
      gross_revenue_idr: grossRevenue,
      total_cost_idr: totalCost,
      cost_breakdown: {
        seeds_idr: seedsCost,
        fertilizer_idr: fertilizerCost,
        labor_idr: laborCost,
        water_pumping_idr: waterCost
      },
      net_profit_idr: netProfit,
      roi_percentage: roi
    }

    // 4. Precision Fertilizer Schedule (Scaled to Land Area)
    const fertilizerSchedule = [
      {
        stage: 'Pupuk Dasar (0–7 HST)',
        day: 'HST 1–7',
        urea_kg: Math.round(50 * areaHa * 10) / 10,
        npk_kg: Math.round(150 * areaHa * 10) / 10,
        organic_kg: Math.round(500 * areaHa * 10) / 10,
        instructions: 'Aplikasi saat olah tanah akhir / sebelum benih ditanam.'
      },
      {
        stage: 'Pemupukan Susulan I (20–25 HST)',
        day: 'HST 21',
        urea_kg: Math.round(75 * areaHa * 10) / 10,
        npk_kg: Math.round(100 * areaHa * 10) / 10,
        organic_kg: 0,
        instructions: 'Memicu percepatan kanopi daun dan pertumbuhan anakan produktif.'
      },
      {
        stage: 'Pemupukan Susulan II (40–45 HST)',
        day: 'HST 42',
        urea_kg: Math.round(50 * areaHa * 10) / 10,
        npk_kg: Math.round(100 * areaHa * 10) / 10,
        organic_kg: 0,
        instructions: 'Mendukung fase inisiasi malai/bunga dan pengisian buah prima.'
      }
    ]

    // 5. Dynamic Pest & Disease Alerts (Triggered by real climate & crop)
    const pestDiseaseAlerts = this.buildPestAlerts(crop, climate)

    return {
      lifecycle_stages: stages,
      soil_water_balance: waterBalance,
      financial_projection: financial,
      fertilizer_schedule: fertilizerSchedule,
      pest_disease_alerts: pestDiseaseAlerts
    }
  }

  private static buildLifecycleStages(crop: Crop, duration: number) {
    return [
      {
        stage_number: 1,
        name: 'Fase Vegetatif Awal & Perakaran',
        day_start: 1,
        day_end: Math.round(duration * 0.25),
        water_need_status: 'Moderate' as const,
        temperature_sensitivity: `Suhu ideal ${crop.optimal_temp_min}–${crop.optimal_temp_max}°C untuk percepatan perkecambahan dan perakaran.`,
        key_activities: ['Penyemaian / pindah tanam', 'Pemupukan dasar N-P-K & Organik', 'Penyulaman bibit mati (HST 7)'],
        potential_risks: ['Genangan air berlebih membusukkan akar muda', 'Serangan orong-orong / ulat tanah']
      },
      {
        stage_number: 2,
        name: 'Fase Vegetatif Aktif & Pembentukan Kanopi',
        day_start: Math.round(duration * 0.25) + 1,
        day_end: Math.round(duration * 0.50),
        water_need_status: 'Moderate' as const,
        temperature_sensitivity: 'Membutuhkan radiasi matahari penuh untuk fotosintesis optimum.',
        key_activities: ['Pemupukan susulan I (Urea + NPK)', 'Penyiangan gulma mekanis / manual', 'Pengairan berkala'],
        potential_risks: ['Defisit air menghambat jumlah anakan produktif', 'Serangan penggerek batang / ulat grayak']
      },
      {
        stage_number: 3,
        name: 'Fase Inisiasi Bunga / Malai (Generatif Kritis)',
        day_start: Math.round(duration * 0.50) + 1,
        day_end: Math.round(duration * 0.75),
        water_need_status: 'Critical' as const,
        temperature_sensitivity: 'Sangat sensitif suhu ekstrem (>35°C atau <20°C memicu sterilitas bunga).',
        key_activities: ['Pemupukan susulan II (Kalium & Fosfat tinggi)', 'Jaga ketersediaan air kapasitas lapang', 'Monitoring harian hama'],
        potential_risks: ['Cekaman kekeringan pada fase ini memangkas hasil panen drastis', 'Hama pengisap bulir / kepinding']
      },
      {
        stage_number: 4,
        name: 'Fase Pengisian Buah & Pematangan',
        day_start: Math.round(duration * 0.75) + 1,
        day_end: duration,
        water_need_status: 'Low' as const,
        temperature_sensitivity: 'Membutuhkan cuaca cerah kering untuk pemasakan optimal.',
        key_activities: ['Pengeringan lahan 10–14 hari sebelum panen', 'Persiapan sanitasi pascapanen', 'Panen raya'],
        potential_risks: ['Hujan lebat saat panen memicu rebah batang dan busuk buah', 'Serangan jamur pascapanen']
      }
    ]
  }

  private static buildPestAlerts(crop: Crop, climate: ClimateSummary) {
    const list = []
    
    // Humidity-triggered fungal risk
    if (climate.current_humidity >= 78) {
      list.push({
        name: crop.slug === 'padi' ? 'Penyakit Hawar Daun / Blast (Pyricularia oryzae)' : 'Penyakit Antraknosa / Patek (Colletotrichum)',
        type: 'Penyakit Jamur' as const,
        trigger_condition: `Kelembapan udara tinggi (${climate.current_humidity}%) dan suhu hangat (${climate.current_temp}°C)`,
        preventive_action: 'Atur sirkulasi kanopi dengan jarak tanam jajar legowo, drainase lancar, dan semprot fungisida preventif.'
      })
    }

    // Crop specific key pests
    if (crop.slug === 'padi') {
      list.push({
        name: 'Wereng Batang Coklat (Nilaparvata lugens)',
        type: 'Hama Serangga' as const,
        trigger_condition: 'Kondisi mikroklimat rimbun lembap dan aplikasi N berlebih',
        preventive_action: 'Terapkan pengeringan berkala (intermittent irrigation) dan lestarikan predator alami.'
      })
    } else if (crop.slug === 'jagung') {
      list.push({
        name: 'Ulat Grayak Jagung (Spodoptera frugiperda / FAW)',
        type: 'Hama Serangga' as const,
        trigger_condition: 'Periode vegetatif awal pada kondisi cuaca transisi',
        preventive_action: 'Inspeksi pucuk daun muda tiap 3 hari dan aplikasi biopestisida Bacillus thuringiensis.'
      })
    } else if (crop.slug === 'cabai-merah' || crop.slug === 'bawang-merah') {
      list.push({
        name: 'Thrips & Kutu Kebul (Bemisia tabaci)',
        type: 'Hama Serangga' as const,
        trigger_condition: 'Cuaca panas terik dengan kelembapan rendah',
        preventive_action: 'Pasang perangkap likat kuning (yellow sticky trap) 40 titik/Ha dan gunakan mulsa perak.'
      })
    } else if (crop.slug === 'kentang' || crop.slug === 'tomat') {
      list.push({
        name: 'Busuk Daun / Phytophthora infestans',
        type: 'Penyakit Jamur' as const,
        trigger_condition: 'Suhu sejuk dataran tinggi dengan kelembapan di atas 85%',
        preventive_action: 'Aplikasi fungisida sistemik berbahan aktif mankozeb / metalaksil secara berkala.'
      })
    }

    return list
  }
}

