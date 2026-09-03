import type { GeocodingResult } from '~/types/weather'

const DEFAULT_INDONESIAN_DISTRICTS: GeocodingResult[] = [
  { id: 1627896, name: 'Kecamatan Candi, Sidoarjo', latitude: -7.4722, longitude: 112.7150, admin1: 'Jawa Timur', admin2: 'Kabupaten Sidoarjo', country: 'Indonesia', country_code: 'ID' },
  { id: 1627897, name: 'Kecamatan Porong, Sidoarjo', latitude: -7.5392, longitude: 112.6983, admin1: 'Jawa Timur', admin2: 'Kabupaten Sidoarjo', country: 'Indonesia', country_code: 'ID' },
  { id: 1627898, name: 'Kecamatan Krian, Sidoarjo', latitude: -7.4089, longitude: 112.5833, admin1: 'Jawa Timur', admin2: 'Kabupaten Sidoarjo', country: 'Indonesia', country_code: 'ID' },
  { id: 1636722, name: 'Kecamatan Kepanjen, Malang', latitude: -8.1311, longitude: 112.5714, admin1: 'Jawa Timur', admin2: 'Kabupaten Malang', country: 'Indonesia', country_code: 'ID' },
  { id: 1636723, name: 'Kecamatan Pujon, Malang', latitude: -7.8489, longitude: 112.4633, admin1: 'Jawa Timur', admin2: 'Kabupaten Malang', country: 'Indonesia', country_code: 'ID' },
  { id: 1642911, name: 'Kecamatan Telukjambe, Karawang', latitude: -6.3475, longitude: 107.2831, admin1: 'Jawa Barat', admin2: 'Kabupaten Karawang', country: 'Indonesia', country_code: 'ID' },
  { id: 1642912, name: 'Kecamatan Rengasdengklok, Karawang', latitude: -6.1583, longitude: 107.2972, admin1: 'Jawa Barat', admin2: 'Kabupaten Karawang', country: 'Indonesia', country_code: 'ID' },
  { id: 1626241, name: 'Kecamatan Pagaden, Subang', latitude: -6.5056, longitude: 107.7958, admin1: 'Jawa Barat', admin2: 'Kabupaten Subang', country: 'Indonesia', country_code: 'ID' },
  { id: 1643837, name: 'Kecamatan Jatibarang, Indramayu', latitude: -6.4736, longitude: 108.3117, admin1: 'Jawa Barat', admin2: 'Kabupaten Indramayu', country: 'Indonesia', country_code: 'ID' },
  { id: 1630789, name: 'Kecamatan Masaran, Sragen', latitude: -7.4722, longitude: 110.9583, admin1: 'Jawa Tengah', admin2: 'Kabupaten Sragen', country: 'Indonesia', country_code: 'ID' },
  { id: 1640100, name: 'Kecamatan Delanggu, Klaten', latitude: -7.6250, longitude: 110.7083, admin1: 'Jawa Tengah', admin2: 'Kabupaten Klaten', country: 'Indonesia', country_code: 'ID' },
  { id: 1633070, name: 'Kecamatan Rogojampi, Banyuwangi', latitude: -8.3056, longitude: 114.2944, admin1: 'Jawa Timur', admin2: 'Kabupaten Banyuwangi', country: 'Indonesia', country_code: 'ID' }
]

export class GeocodingService {
  static async searchLocation(query: string): Promise<GeocodingResult[]> {
    if (!query || query.trim().length === 0) {
      return DEFAULT_INDONESIAN_DISTRICTS.slice(0, 8)
    }

    const cleanQuery = query.trim()

    // 1. Try OpenStreetMap Nominatim for deep subdistrict (Kecamatan / Desa) resolution in Indonesia
    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanQuery + ', Indonesia')}&countrycodes=id&format=json&addressdetails=1&limit=8`
      const res: any = await $fetch(nominatimUrl, {
        headers: { 'User-Agent': 'Taniaman-DSS/1.0 (agri-climate-dss)' },
        timeout: 4000
      })

      if (Array.isArray(res) && res.length > 0) {
        return res.map((item: any, idx: number) => {
          const addr = item.address || {}
          const subdistrict = addr.suburb || addr.municipality || addr.village || addr.town || addr.city_district || ''
          const city = addr.city || addr.regency || addr.county || ''
          const state = addr.state || 'Indonesia'
          
          let displayName = item.name || cleanQuery
          if (subdistrict && city && !displayName.includes(city)) {
            displayName = `Kecamatan ${subdistrict}, ${city}`
          } else if (subdistrict) {
            displayName = `Kecamatan ${subdistrict}, ${state}`
          }

          return {
            id: item.place_id || idx + 1,
            name: displayName,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            admin1: state,
            admin2: city || subdistrict,
            country: 'Indonesia',
            country_code: 'ID'
          }
        })
      }
    } catch (e) {
      console.warn('Nominatim geocoding notice:', e)
    }

    // 2. Open-Meteo Geocoding Fallback
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanQuery)}&count=8&language=id&format=json`
      const res: any = await $fetch(url, { timeout: 3500 })
      
      if (res && res.results && Array.isArray(res.results) && res.results.length > 0) {
        return res.results.map((item: any) => ({
          id: item.id,
          name: item.name,
          latitude: item.latitude,
          longitude: item.longitude,
          elevation: item.elevation,
          admin1: item.admin1 || '',
          admin2: item.admin2 || item.admin3 || '',
          country: item.country || 'Indonesia',
          country_code: item.country_code || 'ID'
        }))
      }
    } catch (err) {
      console.warn('Open-Meteo geocoding fallback notice:', err)
    }

    // 3. Fallback matching
    const qLower = cleanQuery.toLowerCase()
    const filtered = DEFAULT_INDONESIAN_DISTRICTS.filter(c => 
      c.name.toLowerCase().includes(qLower) || 
      (c.admin1 && c.admin1.toLowerCase().includes(qLower)) ||
      (c.admin2 && c.admin2.toLowerCase().includes(qLower))
    )

    if (filtered.length > 0) return filtered

    return [
      {
        id: Math.floor(Math.random() * 100000),
        name: query,
        latitude: -7.4478,
        longitude: 112.7183,
        admin1: 'Jawa Timur',
        admin2: 'Indonesia',
        country: 'Indonesia',
        country_code: 'ID'
      },
      ...DEFAULT_INDONESIAN_DISTRICTS.slice(0, 4)
    ]
  }

  static async reverseGeocode(lat: number, lon: number): Promise<string> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`
      const res: any = await $fetch(url, {
        headers: { 'User-Agent': 'Taniaman-DSS/1.0 (agri-climate-dss)' },
        timeout: 4000
      })

      if (res && res.address) {
        const addr = res.address
        const subdistrict = addr.suburb || addr.municipality || addr.village || addr.town || addr.city_district || ''
        const city = addr.city || addr.regency || addr.county || ''
        const state = addr.state || ''

        if (subdistrict && city) {
          return `Kecamatan ${subdistrict}, ${city}`
        }
        if (city && state) {
          return `${city}, ${state}`
        }
        if (res.name) {
          return res.name
        }
      }
    } catch (e) {
      console.warn('Reverse geocoding notice:', e)
    }

    return `Lahan (${lat.toFixed(4)}°, ${lon.toFixed(4)}°)`
  }
}
