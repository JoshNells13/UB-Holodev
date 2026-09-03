export interface CropLifecycleStage {
  stage_number: number
  name: string
  day_start: number
  day_end: number
  water_need_status: 'Low' | 'Moderate' | 'Critical'
  temperature_sensitivity: string
  key_activities: string[]
  potential_risks: string[]
}

export interface SoilWaterBalance {
  total_crop_water_need_mm: number
  total_projected_rainfall_mm: number
  water_balance_status: 'Surplus' | 'Optimal Balance' | 'Deficit / Cekaman Air'
  irrigation_needed_m3: number
  weekly_irrigation_schedule: { week: number; days: string; amount_m3: number; note: string }[]
}

export interface FinancialProjection {
  estimated_yield_ton_per_ha: number
  total_production_kg: number
  market_price_per_kg: number
  gross_revenue_idr: number
  total_cost_idr: number
  cost_breakdown: {
    seeds_idr: number
    fertilizer_idr: number
    labor_idr: number
    water_pumping_idr: number
  }
  net_profit_idr: number
  roi_percentage: number
}

export interface DetailedAgronomyPlan {
  lifecycle_stages: CropLifecycleStage[]
  soil_water_balance: SoilWaterBalance
  financial_projection: FinancialProjection
  fertilizer_schedule: {
    stage: string
    day: string
    urea_kg: number
    npk_kg: number
    organic_kg: number
    instructions: string
  }[]
  pest_disease_alerts: {
    name: string
    type: 'Penyakit Jamur' | 'Hama Serangga' | 'Bakteri'
    trigger_condition: string
    preventive_action: string
  }[]
}
