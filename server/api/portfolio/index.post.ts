import { CROPS_DATA } from '~/server/data/crops.data'
import { WeatherService } from '~/server/services/weather.service'
import { DecisionEngine } from '~/server/services/decision.service'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const {
    allocations = [],
    planting_date = new Date().toISOString().split('T')[0],
    latitude = -7.4478,
    longitude = 112.7183,
    location_name = 'Sidoarjo',
    total_area = 10000
  } = body || {}

  const fullAllocations = allocations.map((a: any) => {
    const crop = CROPS_DATA.find(c => c.slug === a.crop_slug) || CROPS_DATA[0]
    return {
      crop,
      percentage: Number(a.percentage || 0)
    }
  })

  const climate = await WeatherService.getClimateData(Number(latitude), Number(longitude), String(location_name))

  return DecisionEngine.simulatePortfolio(
    fullAllocations,
    String(planting_date),
    climate,
    Number(total_area)
  )
})
