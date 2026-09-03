<template>
  <div
    class="rounded-2xl border p-5 shadow-clean-sm transition flex flex-col justify-between"
    :class="isBest ? 'border-2 border-zinc-950 bg-white ring-2 ring-zinc-950' : 'border-zinc-300 bg-white'"
  >
    <div>
      <!-- Top header -->
      <div class="flex items-start justify-between gap-2 border-b border-zinc-200 pb-3">
        <div>
          <div class="flex items-center gap-2">
            <span v-if="isBest" class="rounded bg-zinc-950 px-2 py-0.5 text-[9px] font-mono font-bold uppercase text-white">
              Pemenang / Best
            </span>
            <span v-else-if="scenario.is_baseline" class="rounded bg-zinc-200 px-2 py-0.5 text-[9px] font-mono font-bold uppercase text-zinc-800">
              Baseline
            </span>
            <span class="text-[11px] font-mono text-zinc-500">{{ scenario.location_name }}</span>
          </div>
          <h4 class="mt-1.5 text-sm font-extrabold text-zinc-950">{{ scenario.crop.name }}</h4>
        </div>

        <div class="text-right">
          <span class="block font-mono text-2xl font-extrabold text-zinc-950">
            {{ scenario.risk_breakdown.total_score }}
          </span>
          <span class="block text-[10px] font-mono text-zinc-400">/100</span>
        </div>
      </div>

      <!-- Key details -->
      <div class="mt-3 space-y-2 text-xs">
        <div class="flex justify-between font-mono">
          <span class="text-zinc-500">Tanggal Tanam:</span>
          <span class="font-bold text-zinc-900">{{ scenario.planting_date }}</span>
        </div>
        <div class="flex justify-between font-mono">
          <span class="text-zinc-500">Luas Lahan:</span>
          <span class="font-bold text-zinc-900">{{ scenario.land_area.toLocaleString('id-ID') }} m²</span>
        </div>
        <div class="flex justify-between font-mono">
          <span class="text-zinc-500">Status DSS:</span>
          <span class="font-bold text-zinc-950">{{ scenario.risk_breakdown.recommendation }}</span>
        </div>
      </div>

      <!-- Mini risk bars -->
      <div class="mt-4 pt-3 border-t border-zinc-200 grid grid-cols-4 gap-1.5 text-center font-mono text-[10px]">
        <div class="rounded bg-zinc-50 p-1 border border-zinc-200">
          <span class="block text-[8px] text-zinc-400 uppercase">Cuaca</span>
          <span class="font-bold text-zinc-900">{{ scenario.risk_breakdown.weather_risk.score }}</span>
        </div>
        <div class="rounded bg-zinc-50 p-1 border border-zinc-200">
          <span class="block text-[8px] text-zinc-400 uppercase">Air</span>
          <span class="font-bold text-zinc-900">{{ scenario.risk_breakdown.water_risk.score }}</span>
        </div>
        <div class="rounded bg-zinc-50 p-1 border border-zinc-200">
          <span class="block text-[8px] text-zinc-400 uppercase">Kesesuaian</span>
          <span class="font-bold text-zinc-900">{{ scenario.risk_breakdown.crop_suitability_risk.score }}</span>
        </div>
        <div class="rounded bg-zinc-50 p-1 border border-zinc-200">
          <span class="block text-[8px] text-zinc-400 uppercase">Ekonomi</span>
          <span class="font-bold text-zinc-900">{{ scenario.risk_breakdown.economic_risk.score }}</span>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="mt-4 pt-3 border-t border-zinc-200 flex items-center justify-between gap-2">
      <button
        v-if="canRemove"
        type="button"
        @click="$emit('remove', scenario.id)"
        class="text-xs text-zinc-500 hover:text-red-600 transition flex items-center gap-1 font-medium"
      >
        <Trash2 :size="13" />
        <span>Hapus</span>
      </button>

      <button
        type="button"
        @click="$emit('select', scenario)"
        class="ml-auto rounded-lg bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-zinc-800"
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
