export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'

export type RecommendationStatus = 'Highly Recommended' | 'Recommended' | 'Consider Carefully' | 'High Risk'

export interface RiskFactorDetail {
  score: number // 0 to 100 (100 is best / lowest risk)
  risk_level: RiskLevel
  risk_percentage: number // 0 to 100% risk level
  title: string
  description: string
  insights: string[]
}

export interface RiskBreakdown {
  weather_risk: RiskFactorDetail
  water_risk: RiskFactorDetail
  crop_suitability_risk: RiskFactorDetail
  economic_risk: RiskFactorDetail
  total_score: number // 0 - 100
  recommendation: RecommendationStatus
  summary_reason: string
  bullet_reasons: string[]
}

export interface PlantingWindowDay {
  date: string
  score: number
  risk_level: RiskLevel
  recommendation: RecommendationStatus
  is_optimal: boolean
}

export interface PlantingWindowRecommendation {
  startDate: string
  endDate: string
  optimalDate: string
  riskLevel: RiskLevel
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  days: PlantingWindowDay[]
}
