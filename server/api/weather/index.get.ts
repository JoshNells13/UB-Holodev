import { WeatherService } from '~/server/services/weather.service'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const lat = Number(query.lat ?? -7.4478)
  const lon = Number(query.lon ?? 112.7183)
  const name = String(query.name ?? 'Sidoarjo')

  return await WeatherService.getClimateData(lat, lon, name)
})
