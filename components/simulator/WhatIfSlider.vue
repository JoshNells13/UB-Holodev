<template>
  <div class="rounded-2xl border border-forest-900 bg-forest-950 p-6 text-white shadow-premium">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-forest-800 pb-4">
      <div class="flex items-center gap-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-500 text-forest-950 shadow-sm font-bold">
          <Sliders :size="18" />
        </div>
        <div>
          <h3 class="text-xs font-extrabold uppercase tracking-wider text-gold-400">What-If Scenario Simulator</h3>
          <p class="text-[11px] text-emerald-200/80 font-sans">Eksplorasi perubahan tanggal tanam secara instan tanpa re-input manual</p>
        </div>
      </div>
      <span class="inline-flex items-center gap-1.5 rounded-full bg-gold-500/20 border border-gold-500/30 px-3 py-1 font-mono text-[10px] font-bold text-gold-300">
        <Zap :size="12" class="text-gold-400" />
        <span>Live Re-Calculation</span>
      </span>
    </div>

    <!-- What-If Controls -->
    <div class="mt-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
      <!-- Date input & quick buttons -->
      <div class="md:col-span-7 space-y-3.5">
        <div class="flex items-center justify-between">
          <label class="text-xs font-bold text-emerald-100 flex items-center gap-1.5">
            <Calendar :size="14" class="text-gold-400" />
            <span>Tanggal Tanam Skenario:</span>
          </label>
          <span class="font-mono text-xs font-bold text-gold-400 bg-white/10 px-2.5 py-0.5 rounded-md border border-white/10">
            {{ currentDate }}
          </span>
        </div>

        <input
          type="date"
          :value="currentDate"
          @input="onDateInput(($event.target as HTMLInputElement).value)"
          class="w-full rounded-xl border border-forest-800 bg-forest-900 px-3 py-2 text-xs font-semibold text-white focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400 shadow-sm"
        />

        <!-- Quick Shift Buttons -->
        <div>
          <span class="text-[10px] font-mono text-emerald-300/70 uppercase block mb-1.5 font-bold">Geser Jendela Tanam Cepat:</span>
          <div class="grid grid-cols-5 gap-2 font-mono text-xs">
            <button
              v-for="offset in [-14, -7, 7, 14, 21]"
              :key="offset"
              type="button"
              @click="shiftDate(offset)"
              class="rounded-lg border border-forest-700 bg-forest-900 py-1.5 text-[11px] font-bold text-emerald-100 transition-all hover:border-gold-400 hover:bg-gold-500 hover:text-forest-950"
            >
              {{ offset > 0 ? `+${offset}h` : `${offset}h` }}
            </button>
          </div>
        </div>
      </div>

      <!-- Delta Output Score comparison box -->
      <div class="md:col-span-5 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm backdrop-blur-xs">
        <div class="text-[10px] font-mono uppercase text-emerald-300/80 font-bold">Dampak Perubahan Keputusan:</div>
        
        <div class="mt-2 flex items-baseline gap-2">
          <span
            class="font-mono text-3xl sm:text-4xl font-extrabold"
            :class="scoreDelta > 0 ? 'text-gold-400' : scoreDelta < 0 ? 'text-red-400' : 'text-white'"
          >
            {{ scoreDelta > 0 ? `+${scoreDelta.toFixed(1)}` : scoreDelta.toFixed(1) }}
          </span>
          <span class="font-mono text-xs font-semibold text-emerald-200">Poin vs Baseline</span>
        </div>

        <div class="mt-2 text-xs leading-relaxed text-emerald-100/90 font-sans">
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

