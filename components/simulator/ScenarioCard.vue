<template>
  <div
    class="rounded-2xl border p-5 shadow-premium transition-all flex flex-col justify-between"
    :class="isBest ? 'border-2 border-forest-900 bg-emerald-50/20 ring-2 ring-gold-400' : 'border-emerald-950/10 bg-white hover:border-emerald-950/25'"
  >
    <div>
      <!-- Top header -->
      <div class="flex items-start justify-between gap-2 border-b border-zinc-200 pb-3">
        <div>
          <div class="flex items-center gap-2">
            <span v-if="isBest" class="rounded-md bg-forest-900 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase text-gold-400 shadow-xs">
              Pemenang / Best
            </span>
            <span v-else-if="scenario.is_baseline" class="rounded-md bg-zinc-200 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase text-forest-900">
              Baseline
            </span>
            <span class="text-[11px] font-mono text-zinc-500 font-bold">{{ scenario.location_name }}</span>
          </div>
          <h4 class="mt-1.5 text-base font-extrabold text-forest-950">{{ scenario.crop.name }}</h4>
        </div>

        <div class="text-right">
          <span class="block font-mono text-2xl font-extrabold text-forest-950">
            {{ scenario.risk_breakdown.total_score }}
          </span>
          <span class="block text-[10px] font-mono text-zinc-400 font-bold">/100</span>
        </div>
      </div>

      <!-- Key details -->
      <div class="mt-3.5 space-y-2 text-xs">
        <div class="flex justify-between font-mono">
          <span class="text-zinc-500">Tanggal Tanam:</span>
          <span class="font-bold text-forest-950">{{ scenario.planting_date }}</span>
        </div>
        <div class="flex justify-between font-mono">
          <span class="text-zinc-500">Luas Lahan:</span>
          <span class="font-bold text-forest-950">{{ scenario.land_area.toLocaleString('id-ID') }} m²</span>
        </div>
        <div class="flex justify-between font-mono">
          <span class="text-zinc-500">Status DSS:</span>
          <span class="font-bold text-forest-900 bg-emerald-100/70 px-2 py-0.5 rounded text-[11px]">{{ scenario.risk_breakdown.recommendation }}</span>
        </div>
      </div>

      <!-- Mini risk bars -->
      <div class="mt-4 pt-3 border-t border-zinc-200 grid grid-cols-4 gap-1.5 text-center font-mono text-[10px]">
        <div class="rounded-lg bg-emerald-50/40 p-1.5 border border-emerald-950/10">
          <span class="block text-[8px] text-zinc-500 uppercase font-bold">Cuaca</span>
          <span class="font-bold text-forest-950">{{ scenario.risk_breakdown.weather_risk.score }}</span>
        </div>
        <div class="rounded-lg bg-emerald-50/40 p-1.5 border border-emerald-950/10">
          <span class="block text-[8px] text-zinc-500 uppercase font-bold">Air</span>
          <span class="font-bold text-forest-950">{{ scenario.risk_breakdown.water_risk.score }}</span>
        </div>
        <div class="rounded-lg bg-emerald-50/40 p-1.5 border border-emerald-950/10">
          <span class="block text-[8px] text-zinc-500 uppercase font-bold">Kesesuaian</span>
          <span class="font-bold text-forest-950">{{ scenario.risk_breakdown.crop_suitability_risk.score }}</span>
        </div>
        <div class="rounded-lg bg-emerald-50/40 p-1.5 border border-emerald-950/10">
          <span class="block text-[8px] text-zinc-500 uppercase font-bold">Ekonomi</span>
          <span class="font-bold text-forest-950">{{ scenario.risk_breakdown.economic_risk.score }}</span>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="mt-4 pt-3 border-t border-zinc-200 flex items-center justify-between gap-2">
      <button
        v-if="canRemove"
        type="button"
        @click="$emit('remove', scenario.id)"
        class="text-xs text-red-600 hover:text-red-700 transition flex items-center gap-1 font-bold cursor-pointer"
      >
        <Trash2 :size="13" />
        <span>Hapus</span>
      </button>

      <button
        type="button"
        @click="$emit('select', scenario)"
        class="ml-auto rounded-xl bg-forest-900 px-3.5 py-1.5 text-xs font-bold text-gold-400 transition hover:bg-forest-950 shadow-xs cursor-pointer"
      >
        Lihat Detail
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Trash2 } from '@lucide/vue'
import type { ScenarioResult } from '~/types/simulation'

defineProps<{
  scenario: ScenarioResult
  isBest?: boolean
  canRemove?: boolean
}>()

defineEmits<{
  (e: 'remove', id: string): void
  (e: 'select', scenario: ScenarioResult): void
}>()
</script>

