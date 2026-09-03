import { useServerSupabase } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { user_id, scenario } = body || {}

  if (!scenario) {
    throw createError({ statusCode: 400, statusMessage: 'Scenario data is required' })
  }

  const supabase = useServerSupabase()

  try {
    // Check if user_id is a valid UUID
    const isValidUUID = (uuid: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid)
    const validUserId = user_id && isValidUUID(user_id) ? user_id : null

    // 1. Insert into simulations
    const { data: simData, error: simError } = await supabase
      .from('simulations')
      .insert({
        user_id: validUserId,
        title: `Simulasi ${scenario.crop.name} - ${scenario.location_name}`,
        location_name: scenario.location_name,
        latitude: scenario.latitude,
        longitude: scenario.longitude,
        land_area: scenario.land_area
      })
      .select()
      .single()

    if (simError) {
      console.error('Server save simulation error:', simError)
      return { success: false, error: simError.message }
    }

    // 2. Insert into scenarios
    const { data: scData, error: scError } = await supabase
      .from('scenarios')
      .insert({
        simulation_id: simData.id,
        crop_name: scenario.crop.name,
        crop_slug: scenario.crop.slug,
        planting_date: scenario.planting_date,
        weather_score: scenario.risk_breakdown.weather_risk.score,
        water_score: scenario.risk_breakdown.water_risk.score,
        crop_score: scenario.risk_breakdown.crop_suitability_risk.score,
        economic_score: scenario.risk_breakdown.economic_risk.score,
        total_score: scenario.risk_breakdown.total_score,
        weather_risk: scenario.risk_breakdown.weather_risk.risk_level,
        water_risk: scenario.risk_breakdown.water_risk.risk_level,
        economic_risk: scenario.risk_breakdown.economic_risk.risk_level,
        recommendation: scenario.risk_breakdown.recommendation,
        reasons: scenario.risk_breakdown.bullet_reasons,
        metrics: {
          summary: scenario.risk_breakdown.summary_reason,
          planting_window: scenario.planting_window
        }
      })
      .select()
      .single()

    if (scError) {
      console.error('Server save scenario error:', scError)
      return { success: false, error: scError.message }
    }

    return {
      success: true,
      simulation: simData,
      scenario: scData
    }
  } catch (err: any) {
    console.error('Server save simulation exception:', err)
    return { success: false, error: err?.message || 'Server error saving simulation' }
  }
})
