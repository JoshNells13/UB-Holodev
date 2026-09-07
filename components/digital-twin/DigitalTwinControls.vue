<template>
  <div class="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-forest-950/90 backdrop-blur-md border border-forest-800 shadow-premium text-xs font-mono text-white">
    <!-- Camera Reset Button -->
    <button
      type="button"
      @click="$emit('resetCamera')"
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
      title="Reset Sudut Pandang Kamera"
    >
      <Compass :size="14" class="text-gold-400" />
      <span class="text-[11px] font-bold">Reset View</span>
    </button>

    <!-- Auto Rotate Toggle -->
    <button
      type="button"
      @click="$emit('toggleRotate')"
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer"
      :class="isAutoRotate ? 'bg-gold-500 text-forest-950 font-bold shadow-xs' : 'text-emerald-200 hover:text-white hover:bg-white/10'"
      title="Putar Otomatis Diorama"
    >
      <RotateCw :size="14" :class="isAutoRotate ? 'animate-spin' : 'text-gold-400'" />
      <span class="text-[11px] font-bold">Orbit</span>
    </button>

    <div class="h-3.5 w-px bg-forest-700 mx-0.5" />

    <!-- Weather Simulation Selector -->
    <div class="flex items-center gap-1">
      <button
        v-for="w in weatherOptions"
        :key="w.id"
        type="button"
        @click="$emit('changeWeather', w.id)"
        class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer"
        :class="currentWeather === w.id ? 'bg-forest-800 text-gold-300 shadow-xs border border-forest-700' : 'text-emerald-200/80 hover:text-white hover:bg-white/10'"
        :title="w.title"
      >
        <component :is="w.icon" :size="13" class="text-gold-400" />
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

