<template>
  <div class="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 select-none">
    <!-- Top HUD Bar -->
    <div class="flex items-start justify-between gap-3">
      <!-- Left: Crop & Metadata Tag -->
      <div class="pointer-events-auto rounded-2xl bg-white/90 backdrop-blur-md p-3 border border-zinc-200/80 shadow-clean-sm space-y-1 max-w-[260px]">
        <div class="flex items-center gap-1.5">
          <span class="inline-block w-2 h-2 rounded-full animate-pulse" :class="statusDotClass" />
          <span class="text-[10px] font-mono font-extrabold uppercase tracking-wider text-zinc-500">3D Digital Twin</span>
        </div>
        <div class="font-extrabold text-sm text-zinc-950 truncate">
          {{ cropName }}
        </div>
        <div class="flex items-center gap-2 font-mono text-[10px] text-zinc-600">
          <span>{{ (landArea / 10000).toFixed(2) }} Ha ({{ landArea.toLocaleString('id-ID') }} m²)</span>
          <span>•</span>
          <span>{{ formattedDate }}</span>
        </div>
      </div>

      <!-- Right: Overall DSS Score Pill -->
      <div class="pointer-events-auto flex items-center gap-2.5 rounded-2xl bg-white/90 backdrop-blur-md px-3.5 py-2 border border-zinc-200/80 shadow-clean-sm">
        <div class="text-right">
          <span class="block text-[9px] font-mono uppercase text-zinc-400 font-bold">Skor Simulasi</span>
          <div class="flex items-baseline justify-end gap-1">
            <span class="font-mono text-xl font-extrabold text-zinc-950">{{ overallScore }}</span>
            <span class="font-mono text-[10px] text-zinc-400 font-bold">/100</span>
          </div>
        </div>
        <span
          class="rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold"
          :class="scoreBadgeClass"
        >
          {{ recommendationText }}
        </span>
      </div>
    </div>

    <!-- Bottom HUD Bar -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
      <!-- Mini Legends -->
      <div class="pointer-events-auto rounded-2xl bg-white/90 backdrop-blur-md px-3 py-2 border border-zinc-200/80 shadow-clean-sm flex flex-wrap items-center gap-3 text-[11px] font-mono text-zinc-700">
        <div class="flex items-center gap-1" title="Kesesuaian Suhu">
          <Thermometer :size="13" class="text-amber-500" />
          <span>Suhu: <strong>{{ temperatureScore ?? 85 }}</strong></span>
        </div>
        <div class="flex items-center gap-1" title="Kecukupan Air FAO-56">
          <Droplet :size="13" class="text-blue-500" />
          <span>Air: <strong>{{ waterScore ?? 80 }}</strong></span>
        </div>
        <div class="flex items-center gap-1" title="Risiko Cuaca & Presipitasi">
          <CloudRain :size="13" class="text-indigo-500" />
          <span>Cuaca: <strong>{{ weatherScore ?? 88 }}</strong></span>
        </div>
        <div class="flex items-center gap-1" title="Kesesuaian Agroklimat Komoditas">
          <Sprout :size="13" class="text-emerald-600" />
          <span>Kesesuaian: <strong>{{ cropFitScore ?? 90 }}</strong></span>
        </div>
      </div>

      <!-- Controls Slot -->
      <div class="pointer-events-auto">
        <slot name="controls" />
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
          <span>{{ hoverInfo.cropName }}</span>
        </div>
        <span class="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
          {{ hoverInfo.healthStatus }}
        </span>
      </div>
      <div class="text-[10px] text-zinc-300 space-y-0.5">
        <p>• Kebutuhan Air: <strong>{{ hoverInfo.waterRequirementMm }} mm</strong></p>
        <p>• Siklus: <strong>{{ hoverInfo.growthDays }} Hari</strong></p>
        <p>• Status Lahan: <strong>Tumbuh Optimal</strong></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Thermometer, Droplet, CloudRain, Sprout } from '@lucide/vue'
import type { HoverPlantInfo } from './types'

const props = defineProps<{
  cropName: string
  landArea: number
  plantingDate: string
  overallScore: number
  recommendation?: string
  temperatureScore?: number
  waterScore?: number
  weatherScore?: number
  cropFitScore?: number
  hoverInfo: HoverPlantInfo | null
}>()

const formattedDate = computed(() => {
  if (!props.plantingDate) return '-'
  const d = new Date(props.plantingDate)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
})

const recommendationText = computed(() => {
  if (props.recommendation) return props.recommendation
  if (props.overallScore >= 85) return 'Highly Recommended'
  if (props.overallScore >= 70) return 'Recommended'
  if (props.overallScore >= 55) return 'Consider Carefully'
  return 'High Risk'
})

const statusDotClass = computed(() => {
  if (props.overallScore >= 85) return 'bg-emerald-500'
  if (props.overallScore >= 70) return 'bg-emerald-400'
  if (props.overallScore >= 55) return 'bg-amber-400'
  return 'bg-red-500'
})

const scoreBadgeClass = computed(() => {
  if (props.overallScore >= 85) return 'bg-emerald-100 text-emerald-900 border border-emerald-300'
  if (props.overallScore >= 70) return 'bg-zinc-950 text-white'
  if (props.overallScore >= 55) return 'bg-amber-100 text-amber-950 border border-amber-300'
  return 'bg-red-100 text-red-950 border border-red-300'
})
</script>
