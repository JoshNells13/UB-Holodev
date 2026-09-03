import { GeocodingService } from '~/server/services/geocoding.service'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const lat = Number(query.lat)
  const lon = Number(query.lon)

  if (isNaN(lat) || isNaN(lon)) {
    return { name: 'Koordinat Tidak Valid' }
  }

  const name = await GeocodingService.reverseGeocode(lat, lon)
  return { name, latitude: lat, longitude: lon }
})
