import { useServerSupabase } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { simulation_id, user_id } = body || {}

  if (!simulation_id) {
    return { success: false, error: 'simulation_id is required' }
  }

  const supabase = useServerSupabase()

  try {
    // Delete associated scenarios first (cascades should handle it, but be explicit)
    await supabase
      .from('scenarios')
      .delete()
      .eq('simulation_id', simulation_id)

    // Delete the simulation
    const { error } = await supabase
      .from('simulations')
      .delete()
      .eq('id', simulation_id)

    if (error) {
      console.error('Delete simulation error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, message: 'Simulasi berhasil dihapus dari Supabase.' }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Unknown error' }
  }
})
