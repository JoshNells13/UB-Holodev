import type { Crop } from '~/types/crop'
import type { ClimateSummary } from '~/types/weather'
import type { DetailedAgronomyPlan } from '~/types/agronomy'

export class AgronomyService {
  static generateDetailedPlan(
    crop: Crop,
    plantingDateStr: string,
    climate: ClimateSummary,
    landArea = 1000,
    hasIrrigation = true
  ): DetailedAgronomyPlan {
    const areaHa = landArea / 10000
    const duration = Math.round((crop.growth_days_min + crop.growth_days_max) / 2)
    const plantDate = new Date(plantingDateStr)

    // 1. Lifecycle Stages
    const stages = this.buildLifecycleStages(crop, duration)

    // 2. Soil Water Balance Calculation
    const seasonalRain = climate.historical_monthly_rainfall[plantDate.getMonth()] * (duration / 30)
    const cropWaterNeed = crop.water_requirement_mm
    const deficitMm = Math.max(0, cropWaterNeed - seasonalRain)
    const irrigationM3 = (deficitMm / 1000) * landArea * (hasIrrigation ? 1.0 : 0.4)

    const weeklySchedule = []
    const totalWeeks = Math.ceil(duration / 7)
    for (let w = 1; w <= Math.min(16, totalWeeks); w++) {
      const isCritical = w >= 6 && w <= 11 // Flowering / filling
      weeklySchedule.push({
        week: w,
        days: `HST ${((w - 1) * 7) + 1}–${w * 7}`,
        amount_m3: Math.round((irrigationM3 / totalWeeks) * (isCritical ? 1.5 : 0.8)),
        note: isCritical ? 'Fase pembungaan/pengisian: Air kritis wajib terjaga' : 'Pengairan moderat vegetatif'
      })
    }

    const waterBalance = {
      total_crop_water_need_mm: cropWaterNeed,
      total_projected_rainfall_mm: Math.round(seasonalRain),
      water_balance_status: (seasonalRain >= cropWaterNeed * 1.1 ? 'Surplus' : seasonalRain >= cropWaterNeed * 0.8 ? 'Optimal Balance' : 'Deficit / Cekaman Air') as any,
      irrigation_needed_m3: Math.round(irrigationM3),
      weekly_irrigation_schedule: weeklySchedule
    }

    // 3. Financial Projections
    // Benchmark yields per Ha (Indonesia BPS standards)
    const yieldPerHa = crop.slug === 'padi' ? 6.2 : crop.slug === 'jagung' ? 7.5 : crop.slug === 'bawang-merah' ? 10.5 : crop.slug === 'cabai-merah' ? 8.0 : 5.0
    const totalProductionKg = Math.round(yieldPerHa * 1000 * areaHa)
    const grossRevenue = totalProductionKg * crop.market_price_baseline

    // Cost estimation (proportional to land area)
    const seedsCost = Math.round(1800000 * areaHa)
    const fertilizerCost = Math.round(3200000 * areaHa)
    const laborCost = Math.round(4500000 * areaHa)
    const waterCost = hasIrrigation ? Math.round(1200000 * areaHa) : Math.round(400000 * areaHa)
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

    // 4. Precision Fertilizer Schedule
    const fertilizerSchedule = [
      {
        stage: 'Pupuk Dasar (0–7 HST)',
        day: 'HST 1–7',
        urea_kg: Math.round(50 * areaHa),
        npk_kg: Math.round(150 * areaHa),
        organic_kg: Math.round(500 * areaHa),
        instructions: 'Aplikasi saat pengolahan tanah akhir sebelum tanam bibit.'
      },
      {
        stage: 'Pemupukan Susulan I (20–25 HST)',
        day: 'HST 21',
        urea_kg: Math.round(75 * areaHa),
        npk_kg: Math.round(100 * areaHa),
        organic_kg: 0,
        instructions: 'Memicu anakan produktif dan percepatan kanopi daun.'
      },
      {
        stage: 'Pemupukan Susulan II (40–45 HST)',
        day: 'HST 42',
        urea_kg: Math.round(50 * areaHa),
        npk_kg: Math.round(100 * areaHa),
        organic_kg: 0,
        instructions: 'Mendukung inisiasi malai/bunga dan pengisian buah prima.'
      }
    ]

    // 5. Pest & Disease Alerts
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
        temperature_sensitivity: 'Membutuhkan suhu hangat moderat (24–30°C) untuk pembentukan akar.',
        key_activities: ['Penyemaian / pindah tanam', 'Pemupukan dasar N-P-K', 'Penyulaman bibit mati (HST 7)'],
        potential_risks: ['Genangan air berlebih dapat membusukkan akar muda', 'Serangan orong-orong / ulat tanah']
      },
      {
        stage_number: 2,
        name: 'Fase Vegetatif Aktif & Pembentukan Anakan',
        day_start: Math.round(duration * 0.25) + 1,
        day_end: Math.round(duration * 0.50),
        water_need_status: 'Moderate' as const,
        temperature_sensitivity: 'Toleran, membutuhkan radiasi matahari penuh untuk fotosintesis.',
        key_activities: ['Pemupukan susulan I (Urea + NPK)', 'Penyiangan gulma', 'Pengairan macak-macak berkala'],
        potential_risks: ['Defisit air menghambat jumlah anakan produktif', 'Serangan penggerek batang / ulat grayak']
      },
      {
        stage_number: 3,
        name: 'Fase Inisiasi Malai & Pembungaan (Generatif Kritis)',
        day_start: Math.round(duration * 0.50) + 1,
        day_end: Math.round(duration * 0.75),
        water_need_status: 'Critical' as const,
        temperature_sensitivity: 'Sangat sensitif suhu ekstrem (>35°C atau <20°C memicu sterilitas polen).',
        key_activities: ['Pemupukan susulan II (Kalium & Fosfat)', 'Menjaga tinggi genangan air 3–5 cm', 'Monitoring intensif hama'],
        potential_risks: ['Cekaman kekeringan pada fase ini menurunkan hasil hingga 60%', 'Hama walang sangit / kepinding tanah']
      },
      {
        stage_number: 4,
        name: 'Fase Pengisian Bulir & Pematangan',
        day_start: Math.round(duration * 0.75) + 1,
        day_end: duration,
        water_need_status: 'Low' as const,
        temperature_sensitivity: 'Membutuhkan cuaca cerah kering untuk pemasakan optimal dan kadar air rendah.',
        key_activities: ['Pengurangan pasokan air (pengeringan lahan 10 hari sebelum panen)', 'Persiapan alat pascapanen', 'Panen raya'],
        potential_risks: ['Hujan lebat saat panen memicu rebah batang dan gabah bertunas', 'Serangan jamur bulir / busuk buah']
      }
    ]
  }

  private static buildPestAlerts(crop: Crop, climate: ClimateSummary) {
    const list = []
    if (climate.current_humidity > 80) {
      list.push({
        name: 'Penyakit Hawar Daun / Jamur (Blast)',
        type: 'Penyakit Jamur' as const,
        trigger_condition: `Kelembapan udara tinggi (${climate.current_humidity}%) dan curah hujan kerap`,
        preventive_action: 'Atur jarak tanam jajar legowo dan aplikasikan fungisida preventif berbahan aktif triazol.'
      })
    }
    if (crop.slug === 'padi') {
      list.push({
        name: 'Wereng Batang Coklat (Nilaparvata lugens)',
        type: 'Hama Serangga' as const,
        trigger_condition: 'Kondisi mikroklimat lembap dan pemupukan N dosis tinggi',
        preventive_action: 'Gunakan varietas tahan, lakukan pengeringan berkala, dan pertahankan musuh alami.'
      })
    } else if (crop.slug === 'cabai-merah' || crop.slug === 'bawang-merah') {
      list.push({
        name: 'Patek / Antraknosa (Colletotrichum)',
        type: 'Penyakit Jamur' as const,
        trigger_condition: 'Percikan air hujan dan drainase bedengan buruk',
        preventive_action: 'Tinggikan guludan bedengan, pasang mulsa plastik hitam perak, dan semprot fungisida tembaga.'
      })
    }
    return list
  }
}
