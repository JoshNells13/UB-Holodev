<template>
  <div class="relative w-full rounded-3xl border-2 border-zinc-950 bg-slate-100 overflow-hidden shadow-clean-lg transition-all">
    <ClientOnly>
      <!-- Main WebGL 3D Canvas Viewport -->
      <div
        ref="canvasContainer"
        class="relative w-full h-[360px] sm:h-[420px] lg:h-[460px] cursor-grab active:cursor-grabbing select-none"
        @contextmenu.prevent
      >
        <!-- Portfolio 3D HUD Overlay Layer -->
        <div v-if="sceneReady && activeData" class="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 select-none">
          <!-- Top HUD Bar -->
          <div class="flex items-start justify-between gap-3">
            <!-- Left: Metadata & Diversification Index -->
            <div class="pointer-events-auto rounded-2xl bg-white/90 backdrop-blur-md p-3 border border-zinc-200/80 shadow-clean-sm space-y-1 max-w-[280px]">
              <div class="flex items-center gap-1.5">
                <span class="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span class="text-[10px] font-mono font-extrabold uppercase tracking-wider text-zinc-500">3D Portofolio Polikultur</span>
              </div>
              <div class="font-extrabold text-sm text-zinc-950 truncate">
                Diversifikasi Lahan Terpadu
              </div>
              <div class="flex items-center gap-2 font-mono text-[10px] text-zinc-600">
                <span>{{ (activeData.totalArea / 10000).toFixed(1) }} Ha ({{ activeData.totalArea.toLocaleString('id-ID') }} m²)</span>
                <span>•</span>
                <span>HHI: <strong>{{ activeData.diversificationIndex }}</strong>/100</span>
              </div>
            </div>

            <!-- Right: Weighted Score -->
            <div class="pointer-events-auto flex items-center gap-2.5 rounded-2xl bg-white/90 backdrop-blur-md px-3.5 py-2 border border-zinc-200/80 shadow-clean-sm">
              <div class="text-right">
                <span class="block text-[9px] font-mono uppercase text-zinc-400 font-bold">Skor Tertimbang DSS</span>
                <div class="flex items-baseline justify-end gap-1">
                  <span class="font-mono text-xl font-extrabold text-zinc-950">{{ activeData.weightedTotalScore }}</span>
                  <span class="font-mono text-[10px] text-zinc-400 font-bold">/100</span>
                </div>
              </div>
              <span class="rounded-full bg-zinc-950 px-2.5 py-0.5 text-[10px] font-mono font-bold text-white">
                Mitigasi Risiko
              </span>
            </div>
          </div>

          <!-- Bottom HUD Bar -->
          <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <!-- Active Crop Allocations Badges -->
            <div class="pointer-events-auto rounded-2xl bg-white/90 backdrop-blur-md px-3 py-2 border border-zinc-200/80 shadow-clean-sm flex flex-wrap items-center gap-2 text-[11px] font-mono">
              <span class="text-zinc-500 font-bold text-[10px] uppercase">Zonasi Lahan:</span>
              <div
                v-for="alloc in activeAllocations"
                :key="alloc.crop_slug"
                class="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-300 font-bold"
              >
                <span class="w-2 h-2 rounded-full" :class="getCropBadgeDot(alloc.crop_slug)" />
                <span>{{ alloc.crop_name.split(' ')[0] }}: {{ alloc.percentage }}%</span>
              </div>
            </div>

            <!-- Controls Toolbar -->
            <div class="pointer-events-auto">
              <DigitalTwinControls
                :isAutoRotate="isAutoRotate"
                :currentWeather="currentWeatherMode"
                @resetCamera="handleResetCamera"
                @toggleRotate="handleToggleRotate"
                @changeWeather="handleWeatherChange"
              />
            </div>
          </div>

          <!-- Floating Interactive Tooltip -->
          <div
            v-if="hoverInfo && hoverInfo.visible"
            class="pointer-events-none fixed z-50 rounded-xl bg-zinc-950/95 backdrop-blur-md px-3 py-2 text-white shadow-xl border border-zinc-800 text-xs font-mono space-y-1 transition-all duration-75"
            :style="{
              left: `${hoverInfo.x + 15}px`,
              top: `${hoverInfo.y - 45}px`
            }"
          >
            <div class="flex items-center justify-between gap-2 font-bold text-emerald-400">
              <div class="flex items-center gap-1">
                <Sprout :size="13" />
                <span>Zonasi {{ hoverInfo.cropName }}</span>
              </div>
              <span class="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                {{ hoverInfo.percentage }}% Alokasi
              </span>
            </div>
            <div class="text-[10px] text-zinc-300 space-y-0.5">
              <p>• Luas Blok: <strong>{{ hoverInfo.areaM2.toLocaleString('id-ID') }} m²</strong></p>
              <p>• Skor Kelayakan: <strong>{{ hoverInfo.score }}/100</strong></p>
            </div>
          </div>
        </div>
      </div>

      <!-- WebGL Unsupported Fallback -->
      <div
        v-if="webglError"
        class="flex flex-col items-center justify-center p-12 text-center text-zinc-600 space-y-2 h-[360px]"
      >
        <AlertTriangle :size="36" class="text-amber-500" />
        <p class="font-bold text-sm text-zinc-900">Visualisasi 3D WebGL Tidak Tersedia</p>
        <p class="text-xs max-w-sm">Perangkat Anda tidak mendukung akselerasi WebGL atau sedang dinonaktifkan.</p>
      </div>

      <!-- Loading State -->
      <template #fallback>
        <div class="flex flex-col items-center justify-center h-[360px] sm:h-[420px] bg-slate-50 text-zinc-400 space-y-3">
          <Loader2 :size="32" class="animate-spin text-zinc-900" />
          <span class="text-xs font-mono font-bold text-zinc-700">Memuat Visualisasi 3D Portofolio Lahan...</span>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { AlertTriangle, Loader2, Sprout } from '@lucide/vue'
import type { PortfolioDigitalTwinData, HoverPortfolioPlantInfo, WeatherVisualMode } from './types'
import { PortfolioFieldScene } from './scene/PortfolioFieldScene'
import DigitalTwinControls from './DigitalTwinControls.vue'

const props = defineProps<{
  data: PortfolioDigitalTwinData | null
}>()

const canvasContainer = ref<HTMLElement | null>(null)
const sceneReady = ref(false)
const webglError = ref(false)
const isAutoRotate = ref(false)
const currentWeatherMode = ref<WeatherVisualMode>('auto')
const hoverInfo = ref<HoverPortfolioPlantInfo | null>(null)

let portfolioScene: PortfolioFieldScene | null = null
let resizeObserver: ResizeObserver | null = null

const activeData = computed<PortfolioDigitalTwinData | null>(() => props.data)

const activeAllocations = computed(() => {
  if (!props.data?.allocations) return []
  return props.data.allocations.filter(a => a.percentage > 0)
})

const getCropBadgeDot = (slug: string) => {
  if (slug.includes('padi')) return 'bg-emerald-500'
  if (slug.includes('jagung')) return 'bg-amber-400'
  if (slug.includes('kedelai')) return 'bg-lime-500'
  return 'bg-blue-500'
}

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
    portfolioScene = new PortfolioFieldScene(
      canvasContainer.value,
      activeData.value,
      (info) => {
        hoverInfo.value = info
      }
    )
    sceneReady.value = true

    resizeObserver = new ResizeObserver(() => {
      if (portfolioScene) portfolioScene.handleResize()
    })
    resizeObserver.observe(canvasContainer.value)
  } catch (err) {
    console.error('Failed to initialize 3D PortfolioFieldScene:', err)
    webglError.value = true
  }
}

watch(
  () => activeData.value,
  (newData) => {
    if (newData && portfolioScene) {
      portfolioScene.updateData(newData, true)
    } else if (newData && !portfolioScene && canvasContainer.value) {
      initScene()
    }
  },
  { deep: true }
)

const handleResetCamera = () => {
  if (portfolioScene) portfolioScene.resetCamera()
}

const handleToggleRotate = () => {
  isAutoRotate.value = !isAutoRotate.value
  if (portfolioScene) portfolioScene.setAutoRotate(isAutoRotate.value)
}

const handleWeatherChange = (mode: WeatherVisualMode) => {
  currentWeatherMode.value = mode
  if (portfolioScene) portfolioScene.setWeatherMode(mode)
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
  if (portfolioScene) {
    portfolioScene.dispose()
    portfolioScene = null
  }
})
</script>
