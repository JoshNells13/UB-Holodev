<template>
  <div class="relative w-full rounded-3xl border-2 border-zinc-950 bg-slate-100 overflow-hidden shadow-clean-lg transition-all">
    <ClientOnly>
      <!-- Main WebGL 3D Canvas Viewport -->
      <div
        ref="canvasContainer"
        class="relative w-full h-[360px] sm:h-[440px] lg:h-[480px] cursor-grab active:cursor-grabbing select-none"
        @contextmenu.prevent
      >
        <!-- 3D HUD Overlay Layer -->
        <DigitalTwinHUD
          v-if="sceneReady && activeData"
          :cropName="cropDisplayName"
          :landArea="activeData.landArea"
          :plantingDate="activeData.plantingDate"
          :overallScore="activeData.overallScore"
          :recommendation="activeData.recommendation"
          :temperatureScore="activeData.temperatureScore"
          :waterScore="activeData.waterScore"
          :weatherScore="activeData.weatherScore"
          :cropFitScore="activeData.cropFitScore"
          :hoverInfo="hoverInfo"
        >
          <template #controls>
            <DigitalTwinControls
              :isAutoRotate="isAutoRotate"
              :currentWeather="currentWeatherMode"
              @resetCamera="handleResetCamera"
              @toggleRotate="handleToggleRotate"
              @changeWeather="handleWeatherChange"
            />
          </template>
        </DigitalTwinHUD>
      </div>

      <!-- WebGL Unsupported Fallback -->
      <div
        v-if="webglError"
        class="flex flex-col items-center justify-center p-12 text-center text-zinc-600 space-y-2 h-[360px]"
      >
        <AlertTriangle :size="36" class="text-amber-500" />
        <p class="font-bold text-sm text-zinc-900">Visualisasi 3D WebGL Tidak Tersedia</p>
        <p class="text-xs max-w-sm">Perangkat Anda tidak mendukung akselerasi WebGL atau sedang dinonaktifkan. Data simulasi tetap dapat dibaca secara lengkap pada kartu analisis.</p>
      </div>

      <!-- Loading State -->
      <template #fallback>
        <div class="flex flex-col items-center justify-center h-[360px] sm:h-[440px] bg-slate-50 text-zinc-400 space-y-3">
          <Loader2 :size="32" class="animate-spin text-zinc-900" />
          <span class="text-xs font-mono font-bold text-zinc-700">Memuat Miniatur 3D Digital Twin...</span>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { AlertTriangle, Loader2 } from '@lucide/vue'
import type { ScenarioResult } from '~/types/simulation'
import type { DigitalTwinData, HoverPlantInfo, WeatherVisualMode } from './types'
import { FieldScene } from './scene/FieldScene'
import DigitalTwinHUD from './DigitalTwinHUD.vue'
import DigitalTwinControls from './DigitalTwinControls.vue'

const props = defineProps<{
  scenario?: ScenarioResult | null
  data?: DigitalTwinData | null
}>()

const canvasContainer = ref<HTMLElement | null>(null)
const sceneReady = ref(false)
const webglError = ref(false)
const isAutoRotate = ref(false)
const currentWeatherMode = ref<WeatherVisualMode>('auto')
const hoverInfo = ref<HoverPlantInfo | null>(null)

let fieldScene: FieldScene | null = null
let resizeObserver: ResizeObserver | null = null

// Normalize scenario into DigitalTwinData
const activeData = computed<DigitalTwinData | null>(() => {
  if (props.data) return props.data

  if (props.scenario) {
    const sc = props.scenario
    return {
      crop: sc.crop,
      landArea: sc.land_area,
      plantingDate: sc.planting_date,
      locationName: sc.location_name,
      overallScore: sc.risk_breakdown.total_score,
      weatherScore: sc.risk_breakdown.weather_risk.score,
      waterScore: sc.risk_breakdown.water_risk.score,
      temperatureScore: 88,
      cropFitScore: sc.risk_breakdown.crop_suitability_risk.score,
      economicScore: sc.risk_breakdown.economic_risk.score,
      recommendation: sc.risk_breakdown.recommendation,
      weatherRiskLevel: sc.risk_breakdown.weather_risk.risk_level,
      waterRiskLevel: sc.risk_breakdown.water_risk.risk_level,
      precipitation: sc.climate_summary?.total_rainfall_mm ?? 25
    }
  }

  return null
})

const cropDisplayName = computed(() => {
  if (!activeData.value) return 'Lahan Pertanian'
  return typeof activeData.value.crop === 'string' ? activeData.value.crop : activeData.value.crop.name
})

const checkWebGL = (): boolean => {
  try {
    const canvas = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')))
  } catch (e) {
    return false
  }
}

const initScene = () => {
  if (!canvasContainer.value || !activeData.value) return
  if (!checkWebGL()) {
    webglError.value = true
    return
  }

  try {
    fieldScene = new FieldScene(
      canvasContainer.value,
      activeData.value,
      (info) => {
        hoverInfo.value = info
      }
    )
    sceneReady.value = true

    // Setup ResizeObserver for fluid responsiveness
    resizeObserver = new ResizeObserver(() => {
      if (fieldScene) fieldScene.handleResize()
    })
    resizeObserver.observe(canvasContainer.value)
  } catch (err) {
    console.error('Failed to initialize 3D FieldScene:', err)
    webglError.value = true
  }
}

// Watch data changes to trigger smooth 3D transitions
watch(
  () => activeData.value,
  (newData) => {
    if (newData && fieldScene) {
      fieldScene.updateData(newData, true)
    } else if (newData && !fieldScene && canvasContainer.value) {
      initScene()
    }
  },
  { deep: true }
)

const handleResetCamera = () => {
  if (fieldScene) fieldScene.resetCamera()
}

const handleToggleRotate = () => {
  isAutoRotate.value = !isAutoRotate.value
  if (fieldScene) fieldScene.setAutoRotate(isAutoRotate.value)
}

const handleWeatherChange = (mode: WeatherVisualMode) => {
  currentWeatherMode.value = mode
  if (fieldScene) fieldScene.setWeatherMode(mode)
}

onMounted(() => {
  nextTick(() => {
    initScene()
  })
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (fieldScene) {
    fieldScene.dispose()
    fieldScene = null
  }
})
</script>
