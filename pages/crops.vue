<template>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-forest-950/10 pb-5">
      <div>
        <div class="flex items-center gap-2">
          <span class="rounded bg-forest-950 px-2.5 py-0.5 font-mono text-[10px] font-extrabold text-gold-400 uppercase tracking-wider">
            AGRONOMY KNOWLEDGE BASE
          </span>
          <span class="text-xs font-mono text-zinc-500">Database Karakteristik Tanaman</span>
        </div>
        <h1 class="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-forest-950 uppercase">
          Katalog Komoditas Pertanian
        </h1>
      </div>

      <div class="flex items-center gap-3">
        <div class="relative w-full sm:w-72">
          <Search :size="15" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari komoditas..."
            class="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-10 pr-3.5 text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 focus:border-forest-950 focus:outline-none shadow-xs"
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
        class="rounded-xl border px-3.5 py-1.5 font-bold uppercase transition"
        :class="selectedCategory === cat ? 'border-forest-950 bg-forest-950 text-white shadow-xs' : 'border-zinc-200 bg-white text-zinc-700 hover:bg-forest-50 hover:border-forest-300'"
      >
        {{ cat }}
      </button>
    </div>

    <!-- Crops Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="crop in filteredCrops"
        :key="crop.slug"
        class="rounded-3xl border border-forest-950/10 bg-white p-6 shadow-premium flex flex-col justify-between hover:shadow-premium-hover hover:border-forest-950/20 transition"
      >
        <div>
          <!-- Header -->
          <div class="flex items-start justify-between gap-2 border-b border-zinc-100 pb-3.5">
            <div>
              <span class="rounded-full bg-forest-50 px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase text-forest-800 border border-forest-100">
                {{ crop.category }}
              </span>
              <h3 class="mt-2 text-base font-extrabold text-forest-950">{{ crop.name }}</h3>
            </div>
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-forest-50 text-forest-900 border border-forest-100/80">
              <Sprout :size="20" class="text-forest-700" />
            </div>
          </div>

          <p class="mt-3 text-xs text-zinc-600 leading-relaxed">{{ crop.description }}</p>

          <!-- Specifications Table -->
          <div class="mt-4 rounded-2xl border border-zinc-200/80 bg-forest-50/30 p-3.5 space-y-2 font-mono text-xs">
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
            <div class="flex justify-between border-t border-zinc-200/80 pt-2">
              <span class="text-zinc-500">Harga Acuan Pasar:</span>
              <span class="font-extrabold text-gold-600">Rp {{ crop.market_price_baseline.toLocaleString('id-ID') }} / kg</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          @click="simulateWithCrop(crop.slug)"
          class="mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-forest-950 py-3 text-xs font-extrabold text-white transition hover:bg-forest-900 shadow-xs ring-1 ring-forest-900"
        >
          <span>Uji Simulasi Tanaman Ini</span>
          <ArrowRight :size="14" class="text-gold-400" />
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
