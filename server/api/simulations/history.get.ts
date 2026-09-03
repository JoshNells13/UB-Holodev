import { useServerSupabase } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const userId = query.user_id ? String(query.user_id) : null

  const supabase = useServerSupabase()

  try {
    let queryBuilder = supabase
      .from('simulations')
      .select('*, scenarios(*)')
      .order('created_at', { ascending: false })
      .limit(30)

    if (userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      queryBuilder = queryBuilder.eq('user_id', userId)
    }

    const { data, error } = await queryBuilder

    if (error) {
      console.error('Fetch history error:', error)
      return { success: false, error: error.message, data: [] }
    }

    return {
      success: true,
      data: data || []
    }
  } catch (err: any) {
    return { success: false, error: err?.message, data: [] }
  }
})
