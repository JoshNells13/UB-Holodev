import { CROPS_DATA } from '~/server/data/crops.data'
import { WeatherService } from '~/server/services/weather.service'
import { RiskEngine } from '~/server/services/risk.service'
import { DecisionEngine } from '~/server/services/decision.service'
import { AgronomyService } from '~/server/services/agronomy.service'
import type { ScenarioResult } from '~/types/simulation'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const {
    location_name = 'Sidoarjo',
    latitude = -7.4478,
    longitude = 112.7183,
    land_area = 1000,
    crop_slug = 'padi',
    planting_date = new Date().toISOString().split('T')[0],
    irrigation_access = true,
    is_baseline = true
  } = body || {}

  const crop = CROPS_DATA.find(c => c.slug === crop_slug) || CROPS_DATA[0]
  const climate = await WeatherService.getClimateData(Number(latitude), Number(longitude), String(location_name))

  const riskBreakdown = RiskEngine.analyze(
    crop,
    String(planting_date),
    climate,
    Number(land_area),
    Boolean(irrigation_access)
  )

  const plantingWindow = DecisionEngine.calculatePlantingWindow(
    crop,
    String(planting_date),
    climate,
    Number(land_area),
    Boolean(irrigation_access)
  )

  const detailedAgronomy = AgronomyService.generateDetailedPlan(
    crop,
    String(planting_date),
    climate,
    Number(land_area),
    Boolean(irrigation_access)
  )

  const scenarioResult: ScenarioResult = {
    id: 'sc_' + Math.random().toString(36).substring(2, 9),
    crop,
    planting_date: String(planting_date),
    land_area: Number(land_area),
    location_name: String(location_name),
    latitude: Number(latitude),
    longitude: Number(longitude),
    risk_breakdown: riskBreakdown,
    planting_window: plantingWindow,
    climate_summary: climate,
    detailed_agronomy: detailedAgronomy,
    is_baseline: Boolean(is_baseline),
    created_at: new Date().toISOString()
  }

  return scenarioResult
})
