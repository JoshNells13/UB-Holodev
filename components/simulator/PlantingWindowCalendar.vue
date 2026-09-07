<template>
  <div class="rounded-2xl border border-emerald-950/10 bg-white p-6 shadow-premium">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 pb-4">
      <div class="flex items-center gap-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-900 text-gold-400 shadow-sm">
          <CalendarDays :size="18" />
        </div>
        <div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-forest-950">Rekomendasi Jendela Waktu Tanam</h3>
          <p class="text-[11px] text-zinc-500 font-sans">Evaluasi multi-tanggal (+/- 28 hari) untuk meminimalkan risiko agroklimat</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="rounded-full bg-forest-900 px-3 py-1 font-mono text-[11px] font-bold text-gold-400 uppercase tracking-wider shadow-xs">
          Tingkat Keyakinan: {{ windowData.confidence }}
        </span>
      </div>
    </div>

    <!-- Optimal Window Highlight Banner -->
    <div class="mt-5 rounded-2xl border border-forest-900 bg-forest-950 p-5 text-white shadow-premium">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span class="text-[10px] font-mono uppercase text-gold-400 block font-bold tracking-wider">Jendela Tanam Terbaik:</span>
          <h4 class="text-base sm:text-lg font-extrabold text-white font-mono mt-0.5">
            {{ formatDateRange(windowData.startDate, windowData.endDate) }}
          </h4>
        </div>
        <div class="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl border border-white/10">
          <div class="text-right">
            <span class="text-[10px] font-mono uppercase text-emerald-200 block">Tanggal Puncak Rekomendasi:</span>
            <span class="font-mono text-xs font-bold text-gold-400">{{ formatDate(windowData.optimalDate) }}</span>
          </div>
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500 text-forest-950 font-bold">
            <CheckCircle2 :size="20" />
          </div>
        </div>
      </div>
    </div>

    <!-- Scanned Days Matrix -->
    <div class="mt-5">
      <span class="text-[10px] font-mono text-zinc-500 uppercase block mb-3 font-bold tracking-wider">Simulasi Skor Jendela Waktu Tanam:</span>
      <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
        <div
          v-for="d in windowData.days"
          :key="d.date"
          class="rounded-xl border p-3 text-center transition-all duration-200"
          :class="d.is_optimal ? 'border-forest-900 bg-forest-900 text-white shadow-premium ring-2 ring-gold-400' : 'border-zinc-200 bg-zinc-50/70 hover:bg-emerald-50/40 text-zinc-900'"
        >
          <span class="block font-mono text-[10px]" :class="d.is_optimal ? 'text-gold-300 font-bold' : 'text-zinc-500'">
            {{ formatShortDate(d.date) }}
          </span>
          <span class="mt-1 block font-mono text-lg font-extrabold" :class="d.is_optimal ? 'text-white' : 'text-forest-950'">
            {{ d.score }}
          </span>
          <span
            class="mt-1.5 inline-block rounded-md px-2 py-0.5 text-[9px] font-mono uppercase font-bold"
            :class="d.is_optimal ? 'bg-gold-500 text-forest-950 shadow-xs' : getBadgeStyle(d.score)"
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
  return `${d.getDate()}/${d.getMonth() + 1}`
}

const getBadgeStyle = (score: number) => {
  if (score >= 80) return 'bg-emerald-100 text-forest-900 border border-emerald-300'
  if (score >= 65) return 'bg-amber-100 text-amber-900 border border-amber-300'
  return 'bg-zinc-200 text-zinc-700'
}
</script>

