<template>
  <div class="rounded-2xl border border-emerald-950/10 bg-white p-6 shadow-premium">
    <div class="flex items-center justify-between border-b border-zinc-200 pb-3">
      <div class="flex items-center gap-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-900 text-gold-400 shadow-sm font-bold">
          <Award :size="18" />
        </div>
        <div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-forest-950">Skor Rekomendasi Keputusan</h3>
          <p class="text-[11px] text-zinc-500 font-sans">Kalkulasi multi-faktor tertimbang (0–100)</p>
        </div>
      </div>
      <span class="rounded-full bg-forest-950/5 px-3 py-1 font-mono text-[10px] font-bold text-forest-900 border border-forest-950/10">
        Algoritma DSS v1.0
      </span>
    </div>

    <!-- Main Score Layout -->
    <div class="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
      <!-- Left: Big Metric & Status -->
      <div class="sm:col-span-5 flex flex-col items-center sm:items-start text-center sm:text-left">
        <div class="flex items-baseline gap-1.5">
          <span class="font-mono text-5xl sm:text-6xl font-extrabold tracking-tight text-forest-950">
            {{ score.toFixed(1) }}
          </span>
          <span class="font-mono text-sm font-semibold text-zinc-400">/ 100</span>
        </div>

        <!-- Status Badge -->
        <div
          class="mt-3 inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-bold shadow-xs border"
          :class="badgeClass"
        >
          <component :is="statusIcon" :size="15" />
          <span>{{ recommendation }}</span>
        </div>

        <p class="mt-2 text-xs font-mono text-zinc-600">
          Tingkat Risiko Agroklimat: <span class="font-bold text-forest-950">{{ overallRiskLevel }}</span>
        </p>
      </div>

      <!-- Right: Factor Weights Mini-Bar Breakdown -->
      <div class="sm:col-span-7 space-y-3 border-t sm:border-t-0 sm:border-l border-zinc-200 pt-4 sm:pt-0 sm:pl-6">
        <!-- Weather Score -->
        <div>
          <div class="flex justify-between text-xs font-bold text-forest-950 mb-1 font-mono">
            <span class="flex items-center gap-1.5 font-sans">
              <CloudSun :size="14" class="text-forest-800" />
              <span>Risiko Cuaca & Suhu (30%)</span>
            </span>
            <span>{{ weatherScore }}/100</span>
          </div>
          <div class="h-2.5 w-full rounded-full bg-zinc-100 overflow-hidden border border-zinc-200">
            <div
              class="h-full bg-gradient-to-r from-forest-700 to-gold-500 transition-all duration-500 rounded-full"
              :style="{ width: `${weatherScore}%` }"
            ></div>
          </div>
        </div>

        <!-- Water Score -->
        <div>
          <div class="flex justify-between text-xs font-bold text-forest-950 mb-1 font-mono">
            <span class="flex items-center gap-1.5 font-sans">
              <Droplets :size="14" class="text-forest-800" />
              <span>Risiko Kebutuhan Air (25%)</span>
            </span>
            <span>{{ waterScore }}/100</span>
          </div>
          <div class="h-2.5 w-full rounded-full bg-zinc-100 overflow-hidden border border-zinc-200">
            <div
              class="h-full bg-gradient-to-r from-forest-700 to-gold-500 transition-all duration-500 rounded-full"
              :style="{ width: `${waterScore}%` }"
            ></div>
          </div>
        </div>

        <!-- Crop Suitability -->
        <div>
          <div class="flex justify-between text-xs font-bold text-forest-950 mb-1 font-mono">
            <span class="flex items-center gap-1.5 font-sans">
              <CheckCircle2 :size="14" class="text-forest-800" />
              <span>Kesesuaian Tanaman (25%)</span>
            </span>
            <span>{{ cropScore }}/100</span>
          </div>
          <div class="h-2.5 w-full rounded-full bg-zinc-100 overflow-hidden border border-zinc-200">
            <div
              class="h-full bg-gradient-to-r from-forest-700 to-gold-500 transition-all duration-500 rounded-full"
              :style="{ width: `${cropScore}%` }"
            ></div>
          </div>
        </div>

        <!-- Economic Score -->
        <div>
          <div class="flex justify-between text-xs font-bold text-forest-950 mb-1 font-mono">
            <span class="flex items-center gap-1.5 font-sans">
              <TrendingUp :size="14" class="text-forest-800" />
              <span>Stabilitas Ekonomi (20%)</span>
            </span>
            <span>{{ economicScore }}/100</span>
          </div>
          <div class="h-2.5 w-full rounded-full bg-zinc-100 overflow-hidden border border-zinc-200">
            <div
              class="h-full bg-gradient-to-r from-forest-700 to-gold-500 transition-all duration-500 rounded-full"
              :style="{ width: `${economicScore}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary Box -->
    <div class="mt-5 rounded-xl border border-emerald-950/10 bg-emerald-50/40 p-4 text-xs leading-relaxed text-forest-950 font-sans">
      <div class="flex items-center gap-2 font-bold text-forest-950 mb-1">
        <Sparkles :size="15" class="text-gold-600" />
        <span class="font-mono text-[11px] uppercase tracking-wider">Ringkasan Analisis Rekomendasi:</span>
      </div>
      <p class="text-zinc-700">{{ summaryReason }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Award,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  CloudSun,
  Droplets,
  CheckCircle2,
  TrendingUp,
  Sparkles
} from '@lucide/vue'
import type { RecommendationStatus, RiskLevel } from '~/types/risk'

const props = defineProps<{
  score: number
  recommendation: RecommendationStatus
  weatherScore: number
  waterScore: number
  cropScore: number
  economicScore: number
  summaryReason: string
  overallRiskLevel?: RiskLevel
}>()

const statusIcon = computed(() => {
  if (props.score >= 80) return ShieldCheck
  if (props.score >= 65) return CheckCircle
  if (props.score >= 50) return AlertTriangle
  return AlertOctagon
})

const badgeClass = computed(() => {
  if (props.score >= 80) {
    return 'border-forest-900 bg-forest-900 text-gold-400'
  }
  if (props.score >= 65) {
    return 'border-emerald-300 bg-emerald-100 text-forest-900'
  }
  if (props.score >= 50) {
    return 'border-amber-300 bg-amber-100 text-amber-900'
  }
  return 'border-red-300 bg-red-100 text-red-900'
})
</script>

