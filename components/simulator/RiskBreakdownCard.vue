<template>
  <div class="rounded-2xl border border-zinc-300 bg-white p-6 shadow-clean-md">
    <div class="flex items-center justify-between border-b border-zinc-200 pb-3">
      <div class="flex items-center gap-2">
        <div class="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-950 text-white">
          <Layers :size="16" />
        </div>
        <div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-zinc-950">Dekomposisi Risiko Agroklimat</h3>
          <p class="text-[11px] text-zinc-500">Skala risiko: 0–30 Rendah (Low) • 31–60 Sedang (Medium) • 61–100 Tinggi (High)</p>
        </div>
      </div>
    </div>

    <!-- 4 Factor Grid -->
    <div class="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Factor 1: Weather Risk -->
      <div class="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <CloudSun :size="16" class="text-zinc-900" />
            <span class="text-xs font-bold text-zinc-950">A. Weather Risk</span>
          </div>
          <span
            class="rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase border"
            :class="getRiskBadge(breakdown.weather_risk.risk_level)"
          >
            {{ breakdown.weather_risk.risk_level }} ({{ breakdown.weather_risk.risk_percentage }}%)
          </span>
        </div>
        <p class="mt-2 text-xs text-zinc-600 leading-relaxed">{{ breakdown.weather_risk.description }}</p>
        <ul class="mt-2.5 space-y-1 border-t border-zinc-200 pt-2 font-mono text-[11px] text-zinc-500">
          <li v-for="(item, idx) in breakdown.weather_risk.insights" :key="idx" class="flex items-start gap-1.5">
            <span class="text-zinc-400">•</span>
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>

      <!-- Factor 2: Water Risk -->
      <div class="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Droplets :size="16" class="text-zinc-900" />
            <span class="text-xs font-bold text-zinc-950">B. Water Risk</span>
          </div>
          <span
            class="rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase border"
            :class="getRiskBadge(breakdown.water_risk.risk_level)"
          >
            {{ breakdown.water_risk.risk_level }} ({{ breakdown.water_risk.risk_percentage }}%)
          </span>
        </div>
        <p class="mt-2 text-xs text-zinc-600 leading-relaxed">{{ breakdown.water_risk.description }}</p>
        <ul class="mt-2.5 space-y-1 border-t border-zinc-200 pt-2 font-mono text-[11px] text-zinc-500">
          <li v-for="(item, idx) in breakdown.water_risk.insights" :key="idx" class="flex items-start gap-1.5">
            <span class="text-zinc-400">•</span>
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>

      <!-- Factor 3: Crop Suitability Risk -->
      <div class="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Sprout :size="16" class="text-zinc-900" />
            <span class="text-xs font-bold text-zinc-950">C. Crop Suitability Risk</span>
          </div>
          <span
            class="rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase border"
            :class="getRiskBadge(breakdown.crop_suitability_risk.risk_level)"
          >
            {{ breakdown.crop_suitability_risk.risk_level }} ({{ breakdown.crop_suitability_risk.risk_percentage }}%)
          </span>
        </div>
        <p class="mt-2 text-xs text-zinc-600 leading-relaxed">{{ breakdown.crop_suitability_risk.description }}</p>
        <ul class="mt-2.5 space-y-1 border-t border-zinc-200 pt-2 font-mono text-[11px] text-zinc-500">
          <li v-for="(item, idx) in breakdown.crop_suitability_risk.insights" :key="idx" class="flex items-start gap-1.5">
            <span class="text-zinc-400">•</span>
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>

      <!-- Factor 4: Economic Risk -->
      <div class="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <TrendingUp :size="16" class="text-zinc-900" />
            <span class="text-xs font-bold text-zinc-950">D. Economic Risk</span>
          </div>
          <span
            class="rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase border"
            :class="getRiskBadge(breakdown.economic_risk.risk_level)"
          >
            {{ breakdown.economic_risk.risk_level }} ({{ breakdown.economic_risk.risk_percentage }}%)
          </span>
        </div>
        <p class="mt-2 text-xs text-zinc-600 leading-relaxed">{{ breakdown.economic_risk.description }}</p>
        <ul class="mt-2.5 space-y-1 border-t border-zinc-200 pt-2 font-mono text-[11px] text-zinc-500">
          <li v-for="(item, idx) in breakdown.economic_risk.insights" :key="idx" class="flex items-start gap-1.5">
            <span class="text-zinc-400">•</span>
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Explainable Insights List (PRD Section 20 "Why?") -->
    <div class="mt-5 rounded-xl border border-zinc-300 bg-zinc-950 p-4 text-white">
      <div class="flex items-center gap-2 font-bold text-xs uppercase tracking-wider mb-2">
        <CheckSquare :size="14" class="text-zinc-300" />
        <span>Faktor Penjelas Rekomendasi (Explainable AI / DSS):</span>
      </div>
      <div class="space-y-1.5 text-xs text-zinc-300">
        <div v-for="(reason, idx) in breakdown.bullet_reasons" :key="idx" class="flex items-start gap-2">
          <span class="font-bold text-white shrink-0">✓</span>
          <span>{{ reason }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Layers, CloudSun, Droplets, Sprout, TrendingUp, CheckSquare } from '@lucide/vue'
import type { RiskBreakdown, RiskLevel } from '~/types/risk'

defineProps<{
  breakdown: RiskBreakdown
}>()

const getRiskBadge = (level: RiskLevel) => {
  if (level === 'LOW') return 'bg-zinc-100 text-zinc-900 border-zinc-300'
  if (level === 'MEDIUM') return 'bg-zinc-200 text-zinc-950 border-zinc-400'
  return 'bg-zinc-900 text-white border-zinc-950'
}
</script>
