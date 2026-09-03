import { useServerSupabase } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { id, full_name, email, role = 'farmer' } = body || {}

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'User ID is required' })
  }

  const supabase = useServerSupabase()

  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id,
        full_name: full_name || email?.split('@')[0] || 'Petani',
        email,
        role,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Sync profile error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, profile: data }
  } catch (err: any) {
    console.error('Sync profile exception:', err)
    return { success: false, error: err?.message }
  }
})
