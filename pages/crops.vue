<template>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
      <div>
        <div class="flex items-center gap-2">
          <span class="rounded bg-zinc-950 px-2 py-0.5 font-mono text-[10px] font-bold text-white uppercase">
            Agronomy Knowledge Base
          </span>
          <span class="text-xs font-mono text-zinc-500">Database Karakteristik Tanaman</span>
        </div>
        <h1 class="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 uppercase">
          Katalog Komoditas Pertanian
        </h1>
      </div>

      <div class="flex items-center gap-3">
        <div class="relative w-64">
          <Search :size="15" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari komoditas..."
            class="w-full rounded-xl border border-zinc-300 bg-white py-2 pl-9 pr-3 text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-950"
          />
        </div>
      </div>
    </div>

    <!-- Category Filters -->
    <div class="flex flex-wrap items-center gap-2 font-mono text-xs">
      <button
        v-for="cat in categories"
        :key="cat"
        type="button"
        @click="selectedCategory = cat"
        class="rounded-lg border px-3 py-1.5 font-bold uppercase transition"
        :class="selectedCategory === cat ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100'"
      >
        {{ cat }}
      </button>
    </div>

    <!-- Crops Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="crop in filteredCrops"
        :key="crop.slug"
        class="rounded-2xl border border-zinc-300 bg-white p-6 shadow-clean-sm flex flex-col justify-between hover:shadow-clean-md transition"
      >
        <div>
          <!-- Header -->
          <div class="flex items-start justify-between gap-2 border-b border-zinc-200 pb-3">
            <div>
              <span class="rounded bg-zinc-100 px-2 py-0.5 text-[9px] font-mono font-bold uppercase text-zinc-700 border border-zinc-200">
                {{ crop.category }}
              </span>
              <h3 class="mt-2 text-base font-extrabold text-zinc-950">{{ crop.name }}</h3>
            </div>
            <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-950 border border-zinc-200">
              <Sprout :size="18" />
            </div>
          </div>

          <p class="mt-3 text-xs text-zinc-600 leading-relaxed">{{ crop.description }}</p>

          <!-- Specifications Table -->
          <div class="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3 space-y-2 font-mono text-xs">
            <div class="flex justify-between">
              <span class="text-zinc-500">Durasi Pertumbuhan:</span>
              <span class="font-bold text-zinc-900">{{ crop.growth_days_min }}–{{ crop.growth_days_max }} Hari</span>
            </div>
            <div class="flex justify-between">
              <span class="text-zinc-500">Kebutuhan Air Musiman:</span>
              <span class="font-bold text-zinc-900">{{ crop.water_requirement_mm }} mm ({{ crop.water_requirement }})</span>
            </div>
            <div class="flex justify-between">
              <span class="text-zinc-500">Suhu Udara Optimal:</span>
              <span class="font-bold text-zinc-900">{{ crop.optimal_temp_min }}°C – {{ crop.optimal_temp_max }}°C</span>
            </div>
            <div class="flex justify-between">
              <span class="text-zinc-500">Curah Hujan Bulanan:</span>
              <span class="font-bold text-zinc-900">{{ crop.rainfall_min }} – {{ crop.rainfall_max }} mm</span>
            </div>
            <div class="flex justify-between border-t border-zinc-200 pt-1.5">
              <span class="text-zinc-500">Harga Acuan Pasar:</span>
              <span class="font-bold text-zinc-950">Rp {{ crop.market_price_baseline.toLocaleString('id-ID') }} / kg</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          @click="simulateWithCrop(crop.slug)"
          class="mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-950 py-2.5 text-xs font-bold text-white transition hover:bg-zinc-800 shadow-sm"
        >
          <span>Uji Simulasi Tanaman Ini</span>
          <ArrowRight :size="14" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, Sprout, ArrowRight } from '@lucide/vue'
import type { Crop } from '~/types/crop'

const { fetchCrops, runSimulation } = useSimulation()
const { isAuthenticated, openAuthModal } = useAuth()

const crops = ref<Crop[]>([])
const searchQuery = ref('')
const selectedCategory = ref('Semua')

const categories = ['Semua', 'Pangan Utama', 'Palawija', 'Hortikultura', 'Hortikultura Umbi', 'Kacang-kacangan', 'Perkebunan']

const filteredCrops = computed(() => {
  return crops.value.filter(c => {
    const matchCat = selectedCategory.value === 'Semua' || c.category === selectedCategory.value
    const matchQuery = !searchQuery.value || c.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchCat && matchQuery
  })
})

const simulateWithCrop = async (slug: string) => {
  if (!isAuthenticated.value) {
    openAuthModal('/simulate')
    return
  }

  const d = new Date()
  d.setDate(d.getDate() + 15)

  await runSimulation({
    location_name: 'Sidoarjo',
    latitude: -7.4478,
    longitude: 112.7183,
    crop_slug: slug,
    planting_date: d.toISOString().split('T')[0],
    land_area: 1000,
    is_baseline: true
  })

  navigateTo('/simulate')
}

onMounted(async () => {
  crops.value = await fetchCrops()
})
</script>
