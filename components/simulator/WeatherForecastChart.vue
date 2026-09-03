<template>
  <div class="rounded-2xl border border-zinc-300 bg-white p-6 shadow-clean-md">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 pb-3">
      <div class="flex items-center gap-2">
        <div class="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-950 text-white">
          <CloudRain :size="16" />
        </div>
        <div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-zinc-950">Prakiraan Cuaca & Curah Hujan 16 Hari</h3>
          <p class="text-[11px] text-zinc-500">Data terintegrasi Open-Meteo & Agroklimat</p>
        </div>
      </div>
      <div class="flex items-center gap-4 text-[11px] font-mono text-zinc-600">
        <span class="flex items-center gap-1.5">
          <span class="h-2.5 w-2.5 rounded-sm bg-zinc-950"></span>
          <span>Curah Hujan (mm)</span>
        </span>
        <span class="flex items-center gap-1.5">
          <span class="h-0.5 w-3 bg-zinc-600"></span>
          <span>Suhu Max (°C)</span>
        </span>
      </div>
    </div>

    <!-- Chart Canvas / Visualizer -->
    <div class="mt-6 overflow-x-auto">
      <div class="min-w-[650px]">
        <!-- Bar + Line Chart Grid -->
        <div class="relative h-48 w-full border-b border-l border-zinc-300 flex items-end justify-between px-2 pt-6">
          <!-- Horizontal Gridlines -->
          <div class="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
            <div class="border-b border-dashed border-zinc-900 w-full"></div>
            <div class="border-b border-dashed border-zinc-900 w-full"></div>
            <div class="border-b border-dashed border-zinc-900 w-full"></div>
            <div class="border-b border-dashed border-zinc-900 w-full"></div>
          </div>

          <!-- Day Columns -->
          <div
            v-for="(day, idx) in forecast"
            :key="day.date"
            class="group relative flex flex-col items-center flex-1 z-10"
          >
            <!-- Hover Tooltip -->
            <div class="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 rounded bg-zinc-950 px-2 py-1 text-[10px] font-mono text-white whitespace-nowrap shadow-md">
              {{ formatDate(day.date) }}: {{ day.precipitation_sum.toFixed(1) }} mm • {{ day.temp_max }}°C
            </div>

            <!-- Temperature Dot / Line Node -->
            <div
              class="absolute h-2 w-2 rounded-full border border-white bg-zinc-900 transition-all group-hover:scale-125"
              :style="{ bottom: `${calcTempHeight(day.temp_max)}%` }"
            ></div>

            <!-- Rainfall Bar -->
            <div
              class="w-3 sm:w-4 rounded-t-sm bg-zinc-950 transition-all duration-300 group-hover:bg-zinc-700"
              :style="{ height: `${calcRainHeight(day.precipitation_sum)}%` }"
            ></div>
          </div>
        </div>

        <!-- X-Axis Labels (Dates) -->
        <div class="flex justify-between px-2 pt-2 text-[10px] font-mono text-zinc-500">
          <div
            v-for="(day, idx) in forecast"
            :key="day.date"
            class="flex-1 text-center truncate"
          >
            <span v-if="idx % 2 === 0">{{ formatDayShort(day.date) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Climatological Normals Summary -->
    <div class="mt-6 pt-4 border-t border-zinc-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
      <div class="rounded-lg bg-zinc-50 p-2.5 border border-zinc-200">
        <span class="block text-[10px] text-zinc-500 uppercase">Suhu Terkini</span>
        <span class="font-bold text-zinc-950 text-sm">{{ climate?.current_temp?.toFixed(1) || '28.5' }} °C</span>
      </div>
      <div class="rounded-lg bg-zinc-50 p-2.5 border border-zinc-200">
        <span class="block text-[10px] text-zinc-500 uppercase">Kelembapan Udara</span>
        <span class="font-bold text-zinc-950 text-sm">{{ climate?.current_humidity || '78' }} %</span>
      </div>
      <div class="rounded-lg bg-zinc-50 p-2.5 border border-zinc-200">
        <span class="block text-[10px] text-zinc-500 uppercase">Kecepatan Angin</span>
        <span class="font-bold text-zinc-950 text-sm">{{ climate?.current_wind_speed?.toFixed(1) || '8.5' }} km/h</span>
      </div>
      <div class="rounded-lg bg-zinc-50 p-2.5 border border-zinc-200">
        <span class="block text-[10px] text-zinc-500 uppercase">Deskripsi Cuaca</span>
        <span class="font-bold text-zinc-950 text-xs truncate block">{{ climate?.current_weather_desc || 'Cerah Berawan' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CloudRain } from '@lucide/vue'
import type { ClimateSummary, DailyWeatherForecast } from '~/types/weather'

const props = defineProps<{
  climate?: ClimateSummary
}>()

const forecast = computed<DailyWeatherForecast[]>(() => {
  return props.climate?.daily_forecast || []
})

const maxRain = computed(() => {
  if (forecast.value.length === 0) return 50
  const max = Math.max(...forecast.value.map(f => f.precipitation_sum))
  return Math.max(25, max * 1.2)
})

const calcRainHeight = (rain: number) => {
  return Math.min(90, Math.max(4, (rain / maxRain.value) * 85))
}

const calcTempHeight = (temp: number) => {
  // Map 20°C - 36°C to 20% - 90%
  const clamped = Math.min(36, Math.max(20, temp))
  return ((clamped - 20) / 16) * 70 + 20
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

const formatDayShort = (dateStr: string) => {
  const d = new Date(dateStr)
  return `${d.getDate()}/${d.getMonth() + 1}`
}
</script>
