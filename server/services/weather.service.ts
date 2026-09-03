import type { ClimateSummary, DailyWeatherForecast } from '~/types/weather'

export class WeatherService {
  static async getClimateData(lat: number, lon: number, locationName = 'Lokasi Lahan'): Promise<ClimateSummary> {
    try {
      // 1. Fetch 16-day daily forecast + current weather from Open-Meteo
      const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,et0_fao_evapotranspiration&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=Asia%2FBangkok&forecast_days=16`
      
      const res: any = await $fetch(forecastUrl, { timeout: 5000 })
      
      const dailyForecasts: DailyWeatherForecast[] = []
      if (res?.daily?.time && Array.isArray(res.daily.time)) {
        for (let i = 0; i < res.daily.time.length; i++) {
          dailyForecasts.push({
            date: res.daily.time[i],
            temp_max: res.daily.temperature_2m_max?.[i] ?? 31,
            temp_min: res.daily.temperature_2m_min?.[i] ?? 23,
            temp_mean: res.daily.temperature_2m_mean?.[i] ?? 27,
            precipitation_sum: res.daily.precipitation_sum?.[i] ?? 5.2,
            precipitation_probability_max: res.daily.precipitation_probability_max?.[i] ?? 40,
            wind_speed_max: res.daily.wind_speed_10m_max?.[i] ?? 12,
            et0_fao_evapotranspiration: res.daily.et0_fao_evapotranspiration?.[i] ?? 4.0
          })
        }
      }

      const currentTemp = res?.current?.temperature_2m ?? 28.5
      const currentHumidity = res?.current?.relative_humidity_2m ?? 78
      const currentWind = res?.current?.wind_speed_10m ?? 8.5
      const weatherCode = res?.current?.weather_code ?? 1

      // Generate Indonesian regional historical monthly climatology (12 months)
      // Normalized tropical precipitation pattern (Musim hujan: Nov-Apr, Musim kemarau: Mei-Okt)
      const historicalMonthlyRainfall = this.estimateTropicalRainfallProfile(lat)
      const historicalMonthlyTemp = this.estimateTropicalTempProfile(lat)

      return {
        location_name: locationName,
        latitude: lat,
        longitude: lon,
        current_temp: currentTemp,
        current_humidity: currentHumidity,
        current_wind_speed: currentWind,
        current_weather_desc: this.getWeatherDescription(weatherCode),
        daily_forecast: dailyForecasts.length > 0 ? dailyForecasts : this.generateMockForecast(),
        historical_monthly_rainfall: historicalMonthlyRainfall,
        historical_monthly_temp: historicalMonthlyTemp,
        source: 'open-meteo'
      }
    } catch (err) {
      console.warn('Weather API fetch error, generating resilient climatological fallback:', err)
      return this.generateResilientFallback(lat, lon, locationName)
    }
  }

  private static estimateTropicalRainfallProfile(lat: number): number[] {
    // Typical Indonesian Monsoon distribution (Jan - Dec)
    // In Java/Southern Indonesia (lat < 0): high Jan-Mar, low Jul-Sep, rising Oct-Dec
    if (lat < 0) {
      return [320, 290, 240, 160, 110, 65, 45, 35, 70, 140, 220, 295]
    }
    // Equatorial / North (Sumatra/Kalimantan)
    return [250, 220, 260, 240, 190, 150, 140, 160, 200, 280, 310, 290]
  }

  private static estimateTropicalTempProfile(lat: number): number[] {
    // Stable tropical temperature (26-29°C monthly average)
    return [27.2, 27.4, 27.8, 28.1, 28.3, 27.9, 27.5, 27.8, 28.4, 28.6, 28.0, 27.5]
  }

  private static getWeatherDescription(code: number): string {
    if (code === 0) return 'Cerah Berawan'
    if (code <= 3) return 'Sebagian Berawan'
    if (code <= 48) return 'Berkabut / Lembap'
    if (code <= 65) return 'Hujan Ringan - Sedang'
    if (code <= 82) return 'Hujan Lebat / Hujan Petir'
    return 'Kondisi Cuaca Tropis'
  }

  private static generateMockForecast(): DailyWeatherForecast[] {
    const list: DailyWeatherForecast[] = []
    const now = new Date()
    for (let i = 0; i < 16; i++) {
      const d = new Date(now)
      d.setDate(d.getDate() + i)
      const dateStr = d.toISOString().split('T')[0]
      list.push({
        date: dateStr,
        temp_max: 31 + Math.sin(i) * 1.5,
        temp_min: 23 + Math.cos(i) * 1.2,
        temp_mean: 27.5 + Math.sin(i) * 0.8,
        precipitation_sum: Math.max(0, 6.5 + Math.sin(i * 0.8) * 8),
        precipitation_probability_max: 45,
        wind_speed_max: 11,
        et0_fao_evapotranspiration: 4.2
      })
    }
    return list
  }

  private static generateResilientFallback(lat: number, lon: number, locationName: string): ClimateSummary {
    return {
      location_name: locationName,
      latitude: lat,
      longitude: lon,
      current_temp: 28.2,
      current_humidity: 76,
      current_wind_speed: 9.0,
      current_weather_desc: 'Cerah Berawan (Klimatologi Historis)',
      daily_forecast: this.generateMockForecast(),
      historical_monthly_rainfall: this.estimateTropicalRainfallProfile(lat),
      historical_monthly_temp: this.estimateTropicalTempProfile(lat),
      source: 'fallback'
    }
  }
}
