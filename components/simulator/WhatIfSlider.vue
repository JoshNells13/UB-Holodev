<template>
  <div class="rounded-2xl border-2 border-zinc-950 bg-zinc-50 p-6 shadow-clean-lg">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 pb-3">
      <div class="flex items-center gap-2">
        <div class="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-950 text-white">
          <Sliders :size="16" />
        </div>
        <div>
          <h3 class="text-xs font-extrabold uppercase tracking-wider text-zinc-950">🔮 What-If Scenario Simulator</h3>
          <p class="text-[11px] text-zinc-600">Eksplorasi perubahan tanggal tanam secara instan tanpa re-input manual</p>
        </div>
      </div>
      <span class="inline-flex items-center gap-1 rounded bg-zinc-950 px-2 py-0.5 font-mono text-[10px] font-bold text-white">
        <Zap :size="11" />
        <span>Live Re-Calculation</span>
      </span>
    </div>

    <!-- What-If Controls -->
    <div class="mt-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
      <!-- Date input & quick buttons -->
      <div class="md:col-span-7 space-y-3">
        <div class="flex items-center justify-between">
          <label class="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
            <Calendar :size="14" />
            <span>Tanggal Tanam Skenario:</span>
          </label>
          <span class="font-mono text-xs font-bold text-zinc-950 bg-white px-2 py-0.5 rounded border border-zinc-300">
            {{ currentDate }}
          </span>
        </div>

        <input
          type="date"
          :value="currentDate"
          @input="onDateInput(($event.target as HTMLInputElement).value)"
          class="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 focus:border-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-950 shadow-sm"
        />

        <!-- Quick Shift Buttons -->
        <div>
          <span class="text-[10px] font-mono text-zinc-500 uppercase block mb-1.5">Geser Jendela Tanam Cepat:</span>
          <div class="grid grid-cols-5 gap-1.5 font-mono text-xs">
            <button
              v-for="offset in [-14, -7, 7, 14, 21]"
              :key="offset"
              type="button"
              @click="shiftDate(offset)"
              class="rounded-lg border border-zinc-300 bg-white py-1.5 text-[11px] font-bold text-zinc-800 transition hover:border-zinc-950 hover:bg-zinc-950 hover:text-white"
            >
              {{ offset > 0 ? `+${offset}h` : `${offset}h` }}
            </button>
          </div>
        </div>
      </div>

      <!-- Delta Output Score comparison box -->
      <div class="md:col-span-5 rounded-xl border border-zinc-300 bg-white p-4 shadow-sm">
        <div class="text-[10px] font-mono uppercase text-zinc-400">Dampak Perubahan Keputusan:</div>
        
        <div class="mt-2 flex items-baseline gap-2">
          <span
            class="font-mono text-2xl sm:text-3xl font-extrabold"
            :class="scoreDelta >= 0 ? 'text-zinc-950' : 'text-zinc-600'"
          >
            {{ scoreDelta > 0 ? `+${scoreDelta.toFixed(1)}` : scoreDelta.toFixed(1) }}
          </span>
          <span class="font-mono text-xs font-semibold text-zinc-500">Poin vs Baseline</span>
        </div>

        <div class="mt-2 text-[11px] leading-relaxed text-zinc-700">
          <template v-if="scoreDelta > 0">
            Pergeseran waktu tanam meningkatkan kesesuaian agroklimat dan menurunkan risiko defisit air.
          </template>
          <template v-else-if="scoreDelta < 0">
            Pergeseran ini meningkatkan paparan risiko cuaca ekstrem atau ketidaksesuaian temperatur.
          </template>
          <template v-else>
            Menampilkan skenario baseline saat ini.
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Sliders, Zap, Calendar } from '@lucide/vue'

const props = defineProps<{
  currentDate: string
  currentScore: number
  baselineScore: number
}>()

const emit = defineEmits<{
  (e: 'changeDate', newDate: string): void
}>()

const scoreDelta = computed(() => {
  return props.currentScore - props.baselineScore
})

const onDateInput = (val: string) => {
  if (val) emit('changeDate', val)
}

const shiftDate = (days: number) => {
  const d = new Date(props.currentDate)
  d.setDate(d.getDate() + days)
  const newDateStr = d.toISOString().split('T')[0]
  emit('changeDate', newDateStr)
}
</script>
