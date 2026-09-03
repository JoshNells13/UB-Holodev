import { GeocodingService } from '~/server/services/geocoding.service'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = String(query.q || '')
  return await GeocodingService.searchLocation(q)
})
