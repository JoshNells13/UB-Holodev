export interface Crop {
  id?: string
  slug: string
  name: string
  category: string
  description: string
  growth_days_min: number
  growth_days_max: number
  water_requirement: 'Low' | 'Medium' | 'High'
  water_requirement_mm: number
  optimal_temp_min: number
  optimal_temp_max: number
  rainfall_min: number
  rainfall_max: number
  market_price_baseline: number
  created_at?: string
}

export interface CropPortfolioItem {
  crop: Crop
  percentage: number
}
