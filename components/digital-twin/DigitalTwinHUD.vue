<template>
  <div class="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 select-none">
    <!-- Top HUD Bar -->
    <div class="flex items-start justify-between gap-3">
      <!-- Left: Crop & Metadata Tag -->
      <div class="pointer-events-auto rounded-2xl bg-forest-950/90 backdrop-blur-md p-3.5 border border-forest-800 shadow-premium space-y-1 max-w-[280px] text-white">
        <div class="flex items-center gap-1.5">
          <span class="inline-block w-2.5 h-2.5 rounded-full animate-pulse shadow-xs" :class="statusDotClass" />
          <span class="text-[10px] font-mono font-extrabold uppercase tracking-wider text-gold-400">3D Digital Twin Lahan</span>
        </div>
        <div class="font-extrabold text-sm text-white truncate font-sans">
          {{ cropName }}
        </div>
        <div class="flex items-center gap-2 font-mono text-[10px] text-emerald-200/80">
          <span>{{ (landArea / 10000).toFixed(2) }} Ha ({{ landArea.toLocaleString('id-ID') }} m²)</span>
          <span>•</span>
          <span>{{ formattedDate }}</span>
        </div>
      </div>

      <!-- Right: Overall DSS Score Pill -->
      <div class="pointer-events-auto flex items-center gap-3 rounded-2xl bg-forest-950/90 backdrop-blur-md px-4 py-2.5 border border-forest-800 shadow-premium text-white">
        <div class="text-right">
          <span class="block text-[9px] font-mono uppercase text-gold-400 font-bold">Skor DSS</span>
          <div class="flex items-baseline justify-end gap-1">
            <span class="font-mono text-2xl font-extrabold text-white">{{ overallScore }}</span>
            <span class="font-mono text-[10px] text-zinc-400 font-bold">/100</span>
          </div>
        </div>
        <span
          class="rounded-full px-2.5 py-1 text-[10px] font-mono font-bold shadow-xs"
          :class="scoreBadgeClass"
        >
          {{ recommendationText }}
        </span>
      </div>
    </div>

    <!-- Bottom HUD Bar -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
      <!-- Mini Legends -->
      <div class="pointer-events-auto rounded-2xl bg-forest-950/90 backdrop-blur-md px-3.5 py-2.5 border border-forest-800 shadow-premium flex flex-wrap items-center gap-3 text-xs font-mono text-emerald-100">
        <div class="flex items-center gap-1.5" title="Kesesuaian Suhu">
          <Thermometer :size="14" class="text-amber-400" />
          <span>Suhu: <strong class="text-white">{{ temperatureScore ?? 85 }}</strong></span>
        </div>
        <div class="flex items-center gap-1.5" title="Kecukupan Air FAO-56">
          <Droplet :size="14" class="text-cyan-400" />
          <span>Air: <strong class="text-white">{{ waterScore ?? 80 }}</strong></span>
        </div>
        <div class="flex items-center gap-1.5" title="Risiko Cuaca & Presipitasi">
          <CloudRain :size="14" class="text-blue-400" />
          <span>Cuaca: <strong class="text-white">{{ weatherScore ?? 88 }}</strong></span>
        </div>
        <div class="flex items-center gap-1.5" title="Kesesuaian Agroklimat Komoditas">
          <Sprout :size="14" class="text-gold-400" />
          <span>Kesesuaian: <strong class="text-white">{{ cropFitScore ?? 90 }}</strong></span>
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
      class="pointer-events-none fixed z-50 rounded-2xl bg-forest-950/95 backdrop-blur-md px-3.5 py-2.5 text-white shadow-premium border border-gold-500/30 text-xs font-mono space-y-1 transition-all duration-75"
      :style="{
        left: `${hoverInfo.x + 15}px`,
        top: `${hoverInfo.y - 45}px`
      }"
    >
      <div class="flex items-center justify-between gap-3 font-bold text-gold-400">
        <div class="flex items-center gap-1.5">
          <Sprout :size="14" />
          <span>{{ hoverInfo.cropName }}</span>
        </div>
        <span class="text-[10px] px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-300 border border-gold-500/40">
          {{ hoverInfo.healthStatus }}
        </span>
      </div>
      <div class="text-[10px] text-emerald-100/90 space-y-0.5">
        <p>• Kebutuhan Air: <strong>{{ hoverInfo.waterRequirementMm }} mm</strong></p>
        <p>• Siklus: <strong>{{ hoverInfo.growthDays }} Hari</strong></p>
        <p>• Status Lahan: <strong class="text-gold-400">Tumbuh Optimal</strong></p>
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
  if (props.overallScore >= 85) return 'bg-gold-400 ring-2 ring-gold-400/50'
  if (props.overallScore >= 70) return 'bg-emerald-400 ring-2 ring-emerald-400/50'
  if (props.overallScore >= 55) return 'bg-amber-400 ring-2 ring-amber-400/50'
  return 'bg-red-400 ring-2 ring-red-400/50'
})

const scoreBadgeClass = computed(() => {
  if (props.overallScore >= 85) return 'bg-gold-500 text-forest-950 font-extrabold'
  if (props.overallScore >= 70) return 'bg-emerald-500 text-white font-bold'
  if (props.overallScore >= 55) return 'bg-amber-500 text-forest-950 font-bold'
  return 'bg-red-500 text-white font-bold'
})
</script>

