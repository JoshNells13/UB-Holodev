<template>
  <div class="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-white/90 backdrop-blur-md border border-zinc-200 shadow-sm text-xs font-mono">
    <!-- Camera Reset Button -->
    <button
      type="button"
      @click="$emit('resetCamera')"
      class="flex items-center gap-1 px-2.5 py-1 rounded-xl text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 transition"
      title="Reset Sudut Pandang Kamera"
    >
      <Compass :size="13" />
      <span class="text-[11px] font-bold">Reset View</span>
    </button>

    <!-- Auto Rotate Toggle -->
    <button
      type="button"
      @click="$emit('toggleRotate')"
      class="flex items-center gap-1 px-2.5 py-1 rounded-xl transition"
      :class="isAutoRotate ? 'bg-zinc-950 text-white font-bold' : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100'"
      title="Putar Otomatis Diorama"
    >
      <RotateCw :size="13" :class="isAutoRotate ? 'animate-spin' : ''" />
      <span class="text-[11px]">Orbit</span>
    </button>

    <div class="h-3 w-px bg-zinc-300 mx-0.5" />

    <!-- Weather Simulation Selector -->
    <div class="flex items-center gap-0.5">
      <button
        v-for="w in weatherOptions"
        :key="w.id"
        type="button"
        @click="$emit('changeWeather', w.id)"
        class="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition"
        :class="currentWeather === w.id ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'"
        :title="w.title"
      >
        <component :is="w.icon" :size="12" />
        <span>{{ w.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Compass, RotateCw, Sparkles, Sun, CloudRain, Flame } from '@lucide/vue'
import type { WeatherVisualMode } from './types'

defineProps<{
  isAutoRotate: boolean
  currentWeather: WeatherVisualMode
}>()

defineEmits<{
  (e: 'resetCamera'): void
  (e: 'toggleRotate'): void
  (e: 'changeWeather', mode: WeatherVisualMode): void
}>()

const weatherOptions: { id: WeatherVisualMode; label: string; title: string; icon: any }[] = [
  { id: 'auto', label: 'Auto', title: 'Cuaca Sesuai Prediksi Agroklimat', icon: Sparkles },
  { id: 'sunny', label: 'Cerah', title: 'Simulasi Cuaca Cerah', icon: Sun },
  { id: 'rain', label: 'Hujan', title: 'Simulasi Hujan', icon: CloudRain },
  { id: 'drought', label: 'Kering', title: 'Simulasi Stres Kekeringan', icon: Flame }
]
</script>
