import type { Crop } from './crop'
import type { RiskBreakdown, PlantingWindowRecommendation } from './risk'
import type { ClimateSummary } from './weather'
import type { DetailedAgronomyPlan } from './agronomy'

export interface SimulationParams {
  location_name: string
  latitude: number
  longitude: number
  land_area: number // m²
  crop_slug: string
  planting_date: string // YYYY-MM-DD
  irrigation_access?: boolean
}

export interface ScenarioResult {
  id: string
  crop: Crop
  planting_date: string
  land_area: number
  location_name: string
  latitude: number
  longitude: number
  risk_breakdown: RiskBreakdown
  planting_window: PlantingWindowRecommendation
  climate_summary?: ClimateSummary
  detailed_agronomy?: DetailedAgronomyPlan
  is_baseline?: boolean
  created_at?: string
}

export interface ComparisonMatrix {
  scenarios: ScenarioResult[]
  best_scenario_id: string
  comparison_notes: string[]
}

export interface PortfolioAllocation {
  crop_slug: string
  crop_name: string
  percentage: number
  allocated_area_m2: number
  individual_score: number
  risk_contribution: number
}

export interface PortfolioSimulationResult {
  allocations: PortfolioAllocation[]
  weighted_total_score: number
  diversification_index: number // 0-100 (100 = highly diversified)
  composite_weather_risk: string
  composite_water_demand_total_m3: number
  risk_reduction_benefit_pct: number
  recommendation_note: string
}
