<template>
  <div class="rounded-2xl border border-zinc-300 bg-white p-6 shadow-clean-md">
    <div class="flex items-center justify-between border-b border-zinc-200 pb-3">
      <div class="flex items-center gap-2">
        <div class="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-950 text-white">
          <Award :size="16" />
        </div>
        <div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-zinc-950">Skor Rekomendasi Keputusan</h3>
          <p class="text-[11px] text-zinc-500">Kalkulasi multi-faktor tertimbang (0–100)</p>
        </div>
      </div>
      <span class="rounded bg-zinc-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-zinc-700 border border-zinc-200">
        Algoritma DSS v1.0
      </span>
    </div>

    <!-- Main Score Layout -->
    <div class="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
      <!-- Left: Big Metric & Status -->
      <div class="sm:col-span-5 flex flex-col items-center sm:items-start text-center sm:text-left">
        <div class="flex items-baseline gap-1.5">
          <span class="font-mono text-5xl sm:text-6xl font-extrabold tracking-tight text-zinc-950">
            {{ score.toFixed(1) }}
          </span>
          <span class="font-mono text-sm font-semibold text-zinc-400">/ 100</span>
        </div>

        <!-- Status Badge -->
        <div
          class="mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold"
          :class="badgeClass"
        >
          <component :is="statusIcon" :size="14" />
          <span>{{ recommendation }}</span>
        </div>

        <p class="mt-2 text-[11px] font-mono text-zinc-500">
          Tingkat Risiko Agroklimat: <span class="font-bold text-zinc-900">{{ overallRiskLevel }}</span>
        </p>
      </div>

      <!-- Right: Factor Weights Mini-Bar Breakdown -->
      <div class="sm:col-span-7 space-y-2.5 border-t sm:border-t-0 sm:border-l border-zinc-200 pt-4 sm:pt-0 sm:pl-6">
        <!-- Weather Score -->
        <div>
          <div class="flex justify-between text-xs font-medium text-zinc-700 mb-1">
            <span class="flex items-center gap-1.5">
              <CloudSun :size="13" class="text-zinc-900" />
              <span>Risiko Cuaca & Suhu (30%)</span>
            </span>
            <span class="font-mono font-bold text-zinc-950">{{ weatherScore }}/100</span>
          </div>
          <div class="h-2 w-full rounded-full bg-zinc-100 overflow-hidden border border-zinc-200">
            <div
              class="h-full bg-zinc-950 transition-all duration-500"
              :style="{ width: `${weatherScore}%` }"
            ></div>
          </div>
        </div>

        <!-- Water Score -->
        <div>
          <div class="flex justify-between text-xs font-medium text-zinc-700 mb-1">
            <span class="flex items-center gap-1.5">
              <Droplets :size="13" class="text-zinc-900" />
              <span>Risiko Kebutuhan Air (25%)</span>
            </span>
            <span class="font-mono font-bold text-zinc-950">{{ waterScore }}/100</span>
          </div>
          <div class="h-2 w-full rounded-full bg-zinc-100 overflow-hidden border border-zinc-200">
            <div
              class="h-full bg-zinc-950 transition-all duration-500"
              :style="{ width: `${waterScore}%` }"
            ></div>
          </div>
        </div>

        <!-- Crop Suitability -->
        <div>
          <div class="flex justify-between text-xs font-medium text-zinc-700 mb-1">
            <span class="flex items-center gap-1.5">
              <CheckCircle2 :size="13" class="text-zinc-900" />
              <span>Kesesuaian Tanaman (25%)</span>
            </span>
            <span class="font-mono font-bold text-zinc-950">{{ cropScore }}/100</span>
          </div>
          <div class="h-2 w-full rounded-full bg-zinc-100 overflow-hidden border border-zinc-200">
            <div
              class="h-full bg-zinc-950 transition-all duration-500"
              :style="{ width: `${cropScore}%` }"
            ></div>
          </div>
        </div>

        <!-- Economic Score -->
        <div>
          <div class="flex justify-between text-xs font-medium text-zinc-700 mb-1">
            <span class="flex items-center gap-1.5">
              <TrendingUp :size="13" class="text-zinc-900" />
              <span>Stabilitas Ekonomi (20%)</span>
            </span>
            <span class="font-mono font-bold text-zinc-950">{{ economicScore }}/100</span>
          </div>
          <div class="h-2 w-full rounded-full bg-zinc-100 overflow-hidden border border-zinc-200">
            <div
              class="h-full bg-zinc-950 transition-all duration-500"
              :style="{ width: `${economicScore}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary Box -->
    <div class="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 text-xs leading-relaxed text-zinc-700">
      <div class="flex items-center gap-1.5 font-bold text-zinc-950 mb-1">
        <Sparkles :size="14" />
        <span>Ringkasan Analisis Rekomendasi:</span>
      </div>
      <p>{{ summaryReason }}</p>
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
    return 'border-zinc-950 bg-zinc-950 text-white'
  }
  if (props.score >= 65) {
    return 'border-zinc-900 bg-zinc-100 text-zinc-950'
  }
  if (props.score >= 50) {
    return 'border-zinc-400 bg-zinc-200 text-zinc-900'
  }
  return 'border-zinc-800 bg-zinc-300 text-zinc-950'
})
</script>
