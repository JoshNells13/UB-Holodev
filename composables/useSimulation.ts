import type { ScenarioResult, ComparisonMatrix, PortfolioSimulationResult } from '~/types/simulation'
import type { Crop } from '~/types/crop'

export interface SimulationLoadParams {
  location_name: string
  latitude: number
  longitude: number
  land_area: number
  crop_slug: string
  planting_date: string
  irrigation_access: boolean
  simulation_db_id?: string
}

export const useSimulation = () => {
  const currentScenario = useState<ScenarioResult | null>('sim_current_scenario', () => null)
  const baselineScenario = useState<ScenarioResult | null>('sim_baseline_scenario', () => null)
  const comparisonList = useState<ScenarioResult[]>('sim_comparison_list', () => [])
  const savedSimulations = useState<ScenarioResult[]>('sim_saved_list', () => [])
  const isLoading = useState<boolean>('sim_loading', () => false)
  const isComparing = useState<boolean>('sim_comparing', () => false)
  const cropsList = useState<Crop[]>('sim_crops_list', () => [])
  // Pending load params: history page writes here, simulate page reads on mount
  const pendingLoadParams = useState<SimulationLoadParams | null>('sim_pending_load', () => null)
  const supabase = useSupabase()
  const { user } = useAuth()

  // Load Crops catalog
  const fetchCrops = async () => {
    if (cropsList.value.length > 0) return cropsList.value
    try {
      const data = await $fetch<Crop[]>('/api/crops')
      cropsList.value = data
      return data
    } catch (err) {
      console.error('Failed to fetch crops catalog:', err)
      return []
    }
  }

  // Run simulation
  const runSimulation = async (params: {
    location_name: string
    latitude: number
    longitude: number
    land_area: number
    crop_slug: string
    planting_date: string
    irrigation_access?: boolean
    is_baseline?: boolean
  }) => {
    isLoading.value = true
    try {
      const result = await $fetch<ScenarioResult>('/api/simulate', {
        method: 'POST',
        body: params
      })

      currentScenario.value = result
      if (params.is_baseline || !baselineScenario.value) {
        baselineScenario.value = result
      }

      return result
    } catch (err) {
      console.error('Simulation error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // What-If tweak (fast date/crop adjustment)
  const runWhatIf = async (modifiedParams: {
    planting_date?: string
    crop_slug?: string
    land_area?: number
    irrigation_access?: boolean
  }) => {
    if (!currentScenario.value) return null

    const payload = {
      location_name: currentScenario.value.location_name,
      latitude: currentScenario.value.latitude,
      longitude: currentScenario.value.longitude,
      land_area: modifiedParams.land_area ?? currentScenario.value.land_area,
      crop_slug: modifiedParams.crop_slug ?? currentScenario.value.crop.slug,
      planting_date: modifiedParams.planting_date ?? currentScenario.value.planting_date,
      irrigation_access: modifiedParams.irrigation_access ?? true,
      is_baseline: false
    }

    const updated = await runSimulation(payload)
    return updated
  }

  // Add current scenario to comparison matrix
  const addToComparison = (scenario?: ScenarioResult) => {
    const sc = scenario || currentScenario.value
    if (!sc) return

    const exists = comparisonList.value.some(s => s.id === sc.id || (s.crop.slug === sc.crop.slug && s.planting_date === sc.planting_date))
    if (!exists) {
      comparisonList.value.push({ ...sc, id: 'sc_' + Math.random().toString(36).substring(2, 9) })
    }
  }

  const removeFromComparison = (id: string) => {
    comparisonList.value = comparisonList.value.filter(s => s.id !== id)
  }

  const clearComparison = () => {
    comparisonList.value = []
  }

  // Save simulation to Supabase + LocalStorage
  const saveSimulation = async (scenario?: ScenarioResult) => {
    const sc = scenario || currentScenario.value
    if (!sc) return { success: false, message: 'Tidak ada simulasi aktif' }

    // 1. Save to local state and localStorage
    if (!savedSimulations.value.some(s => s.id === sc.id)) {
      savedSimulations.value.unshift(sc)
      if (import.meta.client) {
        localStorage.setItem('taniaman_saved_simulations', JSON.stringify(savedSimulations.value))
      }
    }

    const userId = user.value?.id || null

    // 2. Save directly to Supabase via server API (guaranteed to succeed with Service Role / RLS)
    try {
      const serverRes: any = await $fetch('/api/simulations/save', {
        method: 'POST',
        body: {
          user_id: userId,
          scenario: sc
        }
      })

      if (serverRes?.success && serverRes.simulation) {
        // Attach DB IDs to the object
        const simDbId = serverRes.simulation.id
        const scDbId = serverRes.scenario?.id || simDbId
        ;(sc as any)._simulation_db_id = simDbId
        ;(sc as any)._scenario_db_id = scDbId

        // Update in saved list
        const existingIdx = savedSimulations.value.findIndex(s => s.id === sc.id)
        if (existingIdx !== -1) {
          (savedSimulations.value[existingIdx] as any)._simulation_db_id = simDbId
          ;(savedSimulations.value[existingIdx] as any)._scenario_db_id = scDbId
          if (import.meta.client) {
            localStorage.setItem('taniaman_saved_simulations', JSON.stringify(savedSimulations.value))
          }
        }

        return { success: true, message: 'Simulasi berhasil disimpan ke Supabase PostgreSQL!' }
      }
    } catch (err) {
      console.warn('Server Supabase save notice:', err)
    }

    // 3. Client-side Supabase direct attempt
    try {
      if (user.value && !user.value.id.startsWith('demo-')) {
        const { data: simData, error: simErr } = await supabase
          .from('simulations')
          .insert({
            user_id: user.value.id,
            title: `Simulasi ${sc.crop.name} - ${sc.location_name}`,
            location_name: sc.location_name,
            latitude: sc.latitude,
            longitude: sc.longitude,
            land_area: sc.land_area
          })
          .select()
          .single()

        if (!simErr && simData) {
          await supabase.from('scenarios').insert({
            simulation_id: simData.id,
            crop_name: sc.crop.name,
            crop_slug: sc.crop.slug,
            planting_date: sc.planting_date,
            weather_score: sc.risk_breakdown.weather_risk.score,
            water_score: sc.risk_breakdown.water_risk.score,
            crop_score: sc.risk_breakdown.crop_suitability_risk.score,
            economic_score: sc.risk_breakdown.economic_risk.score,
            total_score: sc.risk_breakdown.total_score,
            weather_risk: sc.risk_breakdown.weather_risk.risk_level,
            water_risk: sc.risk_breakdown.water_risk.risk_level,
            economic_risk: sc.risk_breakdown.economic_risk.risk_level,
            recommendation: sc.risk_breakdown.recommendation,
            reasons: sc.risk_breakdown.bullet_reasons,
            metrics: { summary: sc.risk_breakdown.summary_reason }
          })
          return { success: true, message: 'Simulasi tersimpan ke Supabase' }
        }
      }
    } catch (e) {
      console.warn('Client Supabase direct insert notice:', e)
    }

    return { success: true, message: 'Simulasi tersimpan' }
  }

  // Load saved history from Supabase and LocalStorage
  const loadSavedHistory = async () => {
    if (import.meta.server) return

    // 1. Fetch from Supabase via Server API
    try {
      const userId = user.value?.id || ''
      const res: any = await $fetch(`/api/simulations/history?user_id=${encodeURIComponent(userId)}`)
      
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        const crops = await fetchCrops()
        const mapped: ScenarioResult[] = []

        for (const sim of res.data) {
          if (sim.scenarios && Array.isArray(sim.scenarios)) {
            for (const sc of sim.scenarios) {
              const matchedCrop = crops.find(c => c.slug === sc.crop_slug) || crops[0]
              mapped.push({
                id: sc.id || sim.id,
                _simulation_db_id: sim.id,       // <<< the real simulations table UUID
                _scenario_db_id: sc.id,           // <<< the real scenarios table UUID
                crop: matchedCrop,
                planting_date: sc.planting_date,
                land_area: sim.land_area || 1000,
                location_name: sim.location_name,
                latitude: Number(sim.latitude),
                longitude: Number(sim.longitude),
                risk_breakdown: {
                  weather_risk: {
                    score: Number(sc.weather_score),
                    risk_level: sc.weather_risk,
                    risk_percentage: 100 - Number(sc.weather_score),
                    title: 'Weather Risk',
                    description: 'Risiko cuaca dan anomali suhu.',
                    insights: []
                  },
                  water_risk: {
                    score: Number(sc.water_score),
                    risk_level: sc.water_risk,
                    risk_percentage: 100 - Number(sc.water_score),
                    title: 'Water Risk',
                    description: 'Risiko kecukupan air tanaman.',
                    insights: []
                  },
                  crop_suitability_risk: {
                    score: Number(sc.crop_score),
                    risk_level: 'LOW',
                    risk_percentage: 100 - Number(sc.crop_score),
                    title: 'Crop Suitability Risk',
                    description: 'Kesesuaian agroklimat komoditas.',
                    insights: []
                  },
                  economic_risk: {
                    score: Number(sc.economic_score),
                    risk_level: sc.economic_risk,
                    risk_percentage: 100 - Number(sc.economic_score),
                    title: 'Economic Risk',
                    description: 'Risiko volatilitas pasar.',
                    insights: []
                  },
                  total_score: Number(sc.total_score),
                  recommendation: sc.recommendation,
                  summary_reason: sc.metrics?.summary || 'Rekomendasi berbasis histori Supabase.',
                  bullet_reasons: sc.reasons || []
                },
                planting_window: sc.metrics?.planting_window || {
                  startDate: sc.planting_date,
                  endDate: sc.planting_date,
                  optimalDate: sc.planting_date,
                  riskLevel: sc.weather_risk,
                  confidence: 'HIGH',
                  days: []
                },
                created_at: sc.created_at || sim.created_at
              } as any)
            }
          }
        }

        if (mapped.length > 0) {
          savedSimulations.value = mapped
          localStorage.setItem('taniaman_saved_simulations', JSON.stringify(mapped))
          return
        }
      }
    } catch (err) {
      console.warn('Failed to load history from Supabase:', err)
    }

    // 2. Fallback to LocalStorage if Supabase returned empty
    const stored = localStorage.getItem('taniaman_saved_simulations')
    if (stored) {
      try {
        savedSimulations.value = JSON.parse(stored)
      } catch (e) {
        console.warn('Corrupt local storage:', e)
      }
    }
  }

  // Delete a simulation from Supabase and local state
  const deleteSimulation = async (sc: any) => {
    // Priority: _simulation_db_id (from Supabase-loaded history) → sc.id if it's a UUID
    // sc.id starting with 'sc_' means it's a locally-generated ID, not in Supabase
    const simulationDbId: string | null =
      sc._simulation_db_id ||
      (sc.id && !/^sc_/.test(String(sc.id)) ? String(sc.id) : null)

    // Remove from local state immediately (optimistic UI)
    savedSimulations.value = savedSimulations.value.filter(s => (s as any).id !== sc.id)
    if (import.meta.client) {
      localStorage.setItem('taniaman_saved_simulations', JSON.stringify(savedSimulations.value))
    }

    // Delete from Supabase if we have a valid UUID
    if (simulationDbId) {
      console.log('[TANIAMAN] Deleting simulation from Supabase, simulation_id:', simulationDbId)
      try {
        const res: any = await $fetch('/api/simulations/delete', {
          method: 'POST',
          body: {
            simulation_id: simulationDbId,
            user_id: user.value?.id || ''
          }
        })
        if (res?.success) {
          console.log('[TANIAMAN] Simulation deleted from Supabase successfully')
        } else {
          console.warn('[TANIAMAN] Supabase delete returned error:', res?.error)
        }
        return { success: true }
      } catch (err: any) {
        console.warn('[TANIAMAN] Delete from Supabase failed:', err?.message || err)
        return { success: false, error: err?.message }
      }
    } else {
      // Only in localStorage — already removed above
      console.log('[TANIAMAN] Simulation was local-only (no Supabase ID), removed from localStorage')
      return { success: true }
    }
  }

  // Load a saved simulation into the simulate studio (pre-fill all inputs)
  const loadIntoStudio = (sc: ScenarioResult & { _db_id?: string }) => {
    // Write load params for simulate page to read
    pendingLoadParams.value = {
      location_name: sc.location_name,
      latitude: sc.latitude,
      longitude: sc.longitude,
      land_area: sc.land_area,
      crop_slug: sc.crop.slug,
      planting_date: sc.planting_date,
      irrigation_access: true,
      simulation_db_id: sc._db_id || sc.id
    }
    // Also set current scenario so results panel shows immediately
    currentScenario.value = sc
    navigateTo('/simulate')
  }

  return {
    currentScenario,
    baselineScenario,
    comparisonList,
    savedSimulations,
    cropsList,
    isLoading,
    isComparing,
    pendingLoadParams,
    fetchCrops,
    runSimulation,
    runWhatIf,
    addToComparison,
    removeFromComparison,
    clearComparison,
    saveSimulation,
    loadSavedHistory,
    deleteSimulation,
    loadIntoStudio
  }
}
