<template>
  <div class="rounded-2xl border border-zinc-300 bg-white p-6 shadow-clean-md">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 pb-3">
      <div class="flex items-center gap-2">
        <div class="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-950 text-white">
          <CalendarDays :size="16" />
        </div>
        <div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-zinc-950">Rekomendasi Jendela Waktu Tanam</h3>
          <p class="text-[11px] text-zinc-500">Evaluasi multi-tanggal (+/- 28 hari) untuk meminimalkan risiko agroklimat</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="rounded bg-zinc-950 px-2.5 py-0.5 font-mono text-[10px] font-bold text-white uppercase">
          Tingkat Keyakinan: {{ windowData.confidence }}
        </span>
      </div>
    </div>

    <!-- Optimal Window Highlight Banner -->
    <div class="mt-5 rounded-xl border-2 border-zinc-900 bg-zinc-50 p-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span class="text-[10px] font-mono uppercase text-zinc-500 block">Jendela Tanam Terbaik:</span>
          <h4 class="text-sm sm:text-base font-extrabold text-zinc-950 font-mono">
            {{ formatDateRange(windowData.startDate, windowData.endDate) }}
          </h4>
        </div>
        <div class="flex items-center gap-3">
          <div class="text-right">
            <span class="text-[10px] font-mono uppercase text-zinc-500 block">Tanggal Puncak Rekomendasi:</span>
            <span class="font-mono text-xs font-bold text-zinc-950">{{ formatDate(windowData.optimalDate) }}</span>
          </div>
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-950 text-white font-bold">
            <CheckCircle2 :size="20" />
          </div>
        </div>
      </div>
    </div>

    <!-- Scanned Days Matrix -->
    <div class="mt-5">
      <span class="text-[10px] font-mono text-zinc-500 uppercase block mb-2">Simulasi Skor Jendela Waktu Tanam:</span>
      <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        <div
          v-for="d in windowData.days"
          :key="d.date"
          class="rounded-lg border p-2.5 text-center transition"
          :class="d.is_optimal ? 'border-zinc-950 bg-zinc-950 text-white shadow-md ring-2 ring-zinc-950' : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-900'"
        >
          <span class="block font-mono text-[10px]" :class="d.is_optimal ? 'text-zinc-300' : 'text-zinc-500'">
            {{ formatShortDate(d.date) }}
          </span>
          <span class="mt-1 block font-mono text-base font-extrabold" :class="d.is_optimal ? 'text-white' : 'text-zinc-950'">
            {{ d.score }}
          </span>
          <span
            class="mt-1 inline-block rounded px-1.5 py-0.2 text-[9px] font-mono uppercase font-bold"
            :class="d.is_optimal ? 'bg-white text-zinc-950' : getBadgeStyle(d.score)"
          >
            {{ d.is_optimal ? 'PUNCAK' : d.risk_level }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CalendarDays, CheckCircle2 } from '@lucide/vue'
import type { PlantingWindowRecommendation } from '~/types/risk'

defineProps<{
  windowData: PlantingWindowRecommendation
}>()

const formatDateRange = (start: string, end: string) => {
  if (!start || !end) return '-'
  const s = new Date(start)
  const e = new Date(end)
  return `${s.getDate()} ${s.toLocaleDateString('id-ID', { month: 'short' })} — ${e.getDate()} ${e.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}`
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

const formatShortDate = (dateStr: string) => {
  const d = new Date(dateStr)
  return `${d.getDate()} ${d.toLocaleDateString('id-ID', { month: 'short' })}`
}

const getBadgeStyle = (score: number) => {
  if (score >= 80) return 'bg-zinc-200 text-zinc-950 border border-zinc-300'
  if (score >= 65) return 'bg-zinc-100 text-zinc-800'
  return 'bg-zinc-200 text-zinc-600'
}
</script>
