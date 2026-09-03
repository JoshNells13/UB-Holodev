import type { Crop } from '~/types/crop'
import type { RiskLevel, RecommendationStatus } from '~/types/risk'

export type FieldVisualState = 'healthy' | 'good' | 'caution' | 'risky' | 'critical'

export type WeatherVisualType = 'sunny' | 'rain' | 'drought'

export type WeatherVisualMode = 'auto' | 'sunny' | 'rain' | 'drought'

export interface DigitalTwinData {
  crop: Crop | { name: string; slug: string; water_requirement_mm?: number; growth_days_max?: number; [key: string]: any }
  landArea: number
  plantingDate: string
  locationName?: string
  overallScore: number // 0-100
  weatherScore?: number
  waterScore?: number
  temperatureScore?: number
  cropFitScore?: number
  economicScore?: number
  recommendation?: RecommendationStatus | string
  weatherRiskLevel?: RiskLevel | string
  waterRiskLevel?: RiskLevel | string
  precipitation?: number
  temperature?: number
  rainfall?: number
  irrigationAccess?: boolean
}

export interface HoverPlantInfo {
  cropName: string
  cropSlug: string
  stage: string
  growthDays: number
  waterRequirementMm: number
  healthStatus: string
  score: number
  plantingDate: string
  x: number
  y: number
  visible: boolean
}

export interface PortfolioCropAllocationItem {
  crop_slug: string
  crop_name: string
  percentage: number
  allocated_area_m2?: number
  individual_score?: number
  risk_contribution?: number
}

export interface PortfolioDigitalTwinData {
  allocations: PortfolioCropAllocationItem[]
  totalArea: number
  weightedTotalScore: number
  diversificationIndex: number
  compositeWaterDemandTotalM3?: number
  riskReductionBenefitPct?: number
  locationName?: string
  plantingDate?: string
}

export interface HoverPortfolioPlantInfo {
  cropName: string
  cropSlug: string
  percentage: number
  areaM2: number
  score: number
  x: number
  y: number
  visible: boolean
}

export function getFieldVisualState(overallScore: number): FieldVisualState {
  if (overallScore >= 85) return 'healthy'
  if (overallScore >= 70) return 'good'
  if (overallScore >= 55) return 'caution'
  if (overallScore >= 40) return 'risky'
  return 'critical'
}

export function getPlantStatusColor(state: FieldVisualState): {
  foliage: number
  stem: number
  accent: number
  soilTint: number
} {
  switch (state) {
    case 'healthy':
      return {
        foliage: 0x22c55e, // vibrant emerald green
        stem: 0x16a34a,
        accent: 0xeab308, // golden yellow accent
        soilTint: 0x5c3d2e // rich dark loam soil
      }
    case 'good':
      return {
        foliage: 0x4ade80,
        stem: 0x22c55e,
        accent: 0xfacc15,
        soilTint: 0x6e473b
      }
    case 'caution':
      return {
        foliage: 0xa3e635, // lime yellowish green
        stem: 0x65a30d,
        accent: 0xd97706,
        soilTint: 0x855848
      }
    case 'risky':
      return {
        foliage: 0xca8a04, // faded yellowish brown
        stem: 0xa16207,
        accent: 0xef4444,
        soilTint: 0x9c705e // dry dusty soil
      }
    case 'critical':
      return {
        foliage: 0xb45309, // amber brown
        stem: 0x78350f,
        accent: 0xdc2626,
        soilTint: 0xb8886e // dry parched soil
      }
  }
}
