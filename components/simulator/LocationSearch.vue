<template>
  <div class="relative">
    <label class="block text-xs font-bold uppercase tracking-wider text-forest-950 mb-1.5 flex items-center justify-between">
      <span class="flex items-center gap-1.5">
        <MapPin :size="15" class="text-gold-600" />
        <span>1. Lokasi Lahan</span>
      </span>
      <span v-if="selectedLocation" class="text-[10px] font-mono text-zinc-500 font-bold">
        {{ selectedLocation.latitude.toFixed(3) }}°, {{ selectedLocation.longitude.toFixed(3) }}°
      </span>
    </label>

    <div class="relative">
      <div class="relative flex items-center">
        <Search :size="16" class="absolute left-3.5 text-forest-800/60" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Ketik nama kota / kabupaten (cth: Sidoarjo, Malang, Karawang)..."
          @focus="isDropdownOpen = true"
          @input="handleInput"
          class="w-full rounded-xl border border-emerald-950/15 bg-white py-2.5 pl-10 pr-10 text-xs font-semibold text-forest-950 placeholder:text-zinc-400 placeholder:font-normal focus:border-forest-900 focus:outline-none focus:ring-1 focus:ring-forest-900 shadow-sm"
        />
        <button
          v-if="searchQuery"
          type="button"
          @click="clearSearch"
          class="absolute right-3 text-zinc-400 hover:text-forest-900 cursor-pointer"
        >
          <X :size="14" />
        </button>
      </div>

      <!-- Autocomplete Dropdown -->
      <div
        v-if="isDropdownOpen && results.length > 0"
        class="absolute left-0 right-0 top-full mt-1.5 z-30 max-h-60 overflow-y-auto rounded-2xl border border-emerald-950/15 bg-white p-2 shadow-premium"
      >
        <div class="px-2.5 py-1 text-[10px] font-mono uppercase text-forest-800/80 font-bold">
          Hasil Pencarian Lokasi (Open-Meteo Geocoding)
        </div>
        <button
          v-for="item in results"
          :key="item.id"
          type="button"
          @click="selectItem(item)"
          class="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-all hover:bg-emerald-50/70 cursor-pointer"
          :class="selectedLocation?.name === item.name ? 'bg-emerald-100/70 font-bold' : ''"
        >
          <div class="flex items-center gap-2.5">
            <MapPin :size="14" class="text-forest-800 shrink-0" />
            <div>
              <p class="font-semibold text-forest-950">{{ item.name }}</p>
              <p class="text-[11px] text-zinc-500 font-sans">{{ item.admin1 ? item.admin1 + ', ' : '' }}{{ item.country }}</p>
            </div>
          </div>
          <span class="font-mono text-[10px] text-zinc-400 font-bold">{{ item.latitude.toFixed(2) }}, {{ item.longitude.toFixed(2) }}</span>
        </button>
      </div>
    </div>

    <!-- Quick preset badges -->
    <div class="mt-2.5 flex flex-wrap items-center gap-1.5">
      <span class="text-[10px] font-mono text-zinc-500 uppercase font-bold">Cepat:</span>
      <button
        v-for="city in presetCities"
        :key="city.name"
        type="button"
        @click="selectItem(city)"
        class="rounded-lg border border-emerald-950/10 bg-white px-2.5 py-1 text-[11px] font-semibold text-forest-900 transition-all hover:border-forest-900 hover:bg-forest-900 hover:text-gold-400 shadow-2xs cursor-pointer"
        :class="selectedLocation?.name === city.name ? 'border-forest-900 bg-forest-900 text-gold-400 font-bold' : ''"
      >
        {{ city.name }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { MapPin, Search, X } from '@lucide/vue'
import type { GeocodingResult } from '~/types/weather'

const props = defineProps<{
  modelValue?: { name: string; latitude: number; longitude: number }
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: { name: string; latitude: number; longitude: number }): void
  (e: 'change', val: { name: string; latitude: number; longitude: number }): void
}>()

const searchQuery = ref(props.modelValue?.name || 'Sidoarjo')
const selectedLocation = ref(props.modelValue || { name: 'Sidoarjo', latitude: -7.4478, longitude: 112.7183 })
const isDropdownOpen = ref(false)
const results = ref<GeocodingResult[]>([])

const presetCities: GeocodingResult[] = [
  { id: 1, name: 'Sidoarjo', latitude: -7.4478, longitude: 112.7183, admin1: 'Jawa Timur', country: 'Indonesia' },
  { id: 2, name: 'Malang', latitude: -7.9797, longitude: 112.6304, admin1: 'Jawa Timur', country: 'Indonesia' },
  { id: 3, name: 'Karawang', latitude: -6.3073, longitude: 107.3069, admin1: 'Jawa Barat', country: 'Indonesia' },
  { id: 4, name: 'Subang', latitude: -6.5686, longitude: 107.7634, admin1: 'Jawa Barat', country: 'Indonesia' },
  { id: 5, name: 'Sragen', latitude: -7.4269, longitude: 111.0222, admin1: 'Jawa Tengah', country: 'Indonesia' }
]

let searchTimeout: any = null
const handleInput = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    try {
      const res = await $fetch<GeocodingResult[]>(`/api/geocoding?q=${encodeURIComponent(searchQuery.value)}`)
      results.value = res || []
      isDropdownOpen.value = true
    } catch (e) {
      console.warn('Geocoding search failed:', e)
    }
  }, 300)
}

const selectItem = (item: GeocodingResult) => {
  selectedLocation.value = {
    name: item.name,
    latitude: item.latitude,
    longitude: item.longitude
  }
  searchQuery.value = item.name
  isDropdownOpen.value = false
  emit('update:modelValue', selectedLocation.value)
  emit('change', selectedLocation.value)
}

const clearSearch = () => {
  searchQuery.value = ''
  results.value = presetCities
}

onMounted(async () => {
  if (!props.modelValue) {
    selectItem(presetCities[0])
  }
})
</script>
