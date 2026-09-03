export interface GeocodingResult {
  id: number
  name: string
  latitude: number
  longitude: number
  elevation?: number
  feature_code?: string
  country_code?: string
  admin1?: string
  admin2?: string
  country?: string
}

export interface DailyWeatherForecast {
  date: string
  temp_max: number
  temp_min: number
  temp_mean: number
  precipitation_sum: number
  precipitation_probability_max?: number
  wind_speed_max?: number
  relative_humidity_mean?: number
  et0_fao_evapotranspiration?: number
}

export interface ClimateSummary {
  location_name: string
  latitude: number
  longitude: number
  current_temp: number
  current_humidity: number
  current_wind_speed: number
  current_weather_desc: string
  daily_forecast: DailyWeatherForecast[]
  historical_monthly_rainfall: number[] // 12 months average mm
  historical_monthly_temp: number[] // 12 months average °C
  source: 'open-meteo' | 'nasa-power' | 'fallback'
}
