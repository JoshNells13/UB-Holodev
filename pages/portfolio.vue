<template>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
      <div>
        <div class="flex items-center gap-2">
          <span class="rounded bg-zinc-950 px-2 py-0.5 font-mono text-[10px] font-bold text-white uppercase">
            Diversification Engine
          </span>
          <span class="text-xs font-mono text-zinc-500">Mitigasi Risiko Monokultur & Optimasi Hasil</span>
        </div>
        <h1 class="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 uppercase">
          Simulator Portofolio Lahan
        </h1>
      </div>

      <!-- Quick Area Info -->
      <div class="flex items-center gap-3 font-mono text-xs text-zinc-700 bg-zinc-100 px-4 py-2 rounded-xl border border-zinc-200">
        <Maximize2 :size="15" class="text-zinc-900" />
        <span>Total Luas: <strong>{{ totalArea.toLocaleString('id-ID') }} m²</strong> ({{ (totalArea / 10000).toFixed(2) }} Ha)</span>
      </div>
    </div>

    <!-- Workspace Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Left Column: Crop Allocation Sliders & Presets -->
      <div class="lg:col-span-5 space-y-6">
        <div class="rounded-2xl border-2 border-zinc-950 bg-zinc-50 p-6 shadow-clean-md space-y-5">
          <!-- Area Setting -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-xs font-extrabold uppercase tracking-wider text-zinc-950 flex items-center gap-1.5">
                <Maximize2 :size="14" />
                <span>1. Luas Keseluruhan Lahan (m²)</span>
              </label>
              <span class="font-mono text-[11px] font-bold text-zinc-600">{{ (totalArea / 10000).toFixed(2) }} Hektar</span>
            </div>
            <input
              type="number"
              min="500"
              max="100000"
              step="500"
              v-model.number="totalArea"
              @change="calculatePortfolio"
              class="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-mono font-bold text-zinc-900 focus:border-zinc-950 focus:outline-none shadow-sm"
            />
            <!-- Quick Area Presets -->
            <div class="flex flex-wrap items-center gap-1.5 pt-1">
              <button
                v-for="preset in areaPresets"
                :key="preset.value"
                type="button"
                @click="setArea(preset.value)"
                class="rounded-lg border px-2 py-1 text-[10px] font-mono font-bold transition"
                :class="totalArea === preset.value ? 'bg-zinc-950 text-white border-zinc-950' : 'bg-white text-zinc-700 border-zinc-300 hover:border-zinc-950'"
              >
                {{ preset.label }}
              </button>
            </div>
          </div>

          <!-- Preset Portfolios -->
          <div class="pt-3 border-t border-zinc-200">
            <span class="text-[10px] font-mono uppercase text-zinc-500 block mb-2 font-bold">2. Paket Skenario Polikultur:</span>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                @click="applyPreset('monoculture')"
                class="rounded-xl border border-zinc-300 bg-white py-2 px-2.5 text-[11px] font-bold text-zinc-800 transition hover:border-zinc-950 hover:bg-zinc-950 hover:text-white text-left shadow-xs"
              >
                🌾 100% Monokultur Padi
              </button>
              <button
                type="button"
                @click="applyPreset('duoculture')"
                class="rounded-xl border border-zinc-300 bg-white py-2 px-2.5 text-[11px] font-bold text-zinc-800 transition hover:border-zinc-950 hover:bg-zinc-950 hover:text-white text-left shadow-xs"
              >
                🌽 70% Padi + 30% Jagung
              </button>
              <button
                type="button"
                @click="applyPreset('triculture')"
                class="rounded-xl border border-zinc-300 bg-white py-2 px-2.5 text-[11px] font-bold text-zinc-800 transition hover:border-zinc-950 hover:bg-zinc-950 hover:text-white text-left shadow-xs"
              >
                🌱 50% Padi + 30% Jagung + 20% Kedelai
              </button>
              <button
                type="button"
                @click="applyPreset('horticulture')"
                class="rounded-xl border border-zinc-300 bg-white py-2 px-2.5 text-[11px] font-bold text-zinc-800 transition hover:border-zinc-950 hover:bg-zinc-950 hover:text-white text-left shadow-xs"
              >
                🌶️ 40% Padi + 30% Cabai + 30% Bawang
              </button>
            </div>
          </div>

          <!-- Crop Allocation Sliders & Dynamic List -->
          <div class="space-y-4 pt-3 border-t border-zinc-200">
            <div class="flex items-center justify-between">
              <h3 class="text-xs font-extrabold uppercase tracking-wider text-zinc-950 flex items-center gap-1.5">
                <PieChart :size="15" />
                <span>3. Alokasi Proporsi Komoditas</span>
              </h3>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  @click="balanceAllocations"
                  class="text-[10px] font-mono font-bold text-zinc-600 hover:text-zinc-950 underline"
                  title="Otomatis ratakan proporsi menjadi 100%"
                >
                  ⚖️ Seimbangkan 100%
                </button>
                <span
                  class="font-mono text-xs font-bold px-2 py-0.5 rounded"
                  :class="totalPercentage === 100 ? 'bg-zinc-950 text-white' : 'bg-red-100 text-red-700 border border-red-300'"
                >
                  Total: {{ totalPercentage }}%
                </span>
              </div>
            </div>

            <!-- List of Allocated Crops -->
            <div class="space-y-3.5">
              <div
                v-for="item in allocations"
                :key="item.crop_slug"
                class="rounded-xl border border-zinc-200 bg-white p-3 space-y-2 shadow-xs"
              >
                <div class="flex items-center justify-between text-xs">
                  <div class="flex items-center gap-2 font-bold text-zinc-950">
                    <span class="w-2.5 h-2.5 rounded-full" :class="getCropBadgeColor(item.crop_slug)" />
                    <span>{{ item.crop_name }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="font-mono font-extrabold text-zinc-900">
                      {{ item.percentage }}% ({{ Math.round((item.percentage / 100) * totalArea).toLocaleString('id-ID') }} m²)
                    </span>
                    <button
                      v-if="allocations.length > 1"
                      type="button"
                      @click="removeCrop(item.crop_slug)"
                      class="text-zinc-400 hover:text-red-600 transition p-0.5"
                      title="Hapus dari alokasi"
                    >
                      <Trash2 :size="13" />
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  v-model.number="item.percentage"
                  @input="calculatePortfolio"
                  class="w-full accent-zinc-950 bg-zinc-200 h-2 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <!-- Add Crop Dropdown Selector -->
            <div v-if="availableCropsToAdd.length > 0" class="pt-1">
              <div class="flex items-center gap-2">
                <select
                  v-model="selectedCropSlugToAdd"
                  class="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 focus:border-zinc-950 focus:outline-none shadow-xs"
                >
                  <option value="" disabled>+ Pilih komoditas dari database...</option>
                  <option
                    v-for="c in availableCropsToAdd"
                    :key="c.slug"
                    :value="c.slug"
                  >
                    {{ c.name }} ({{ c.category }})
                  </option>
                </select>
                <button
                  type="button"
                  @click="addSelectedCrop"
                  :disabled="!selectedCropSlugToAdd"
                  class="flex items-center gap-1 rounded-xl bg-zinc-950 px-3.5 py-2 text-xs font-bold text-white hover:bg-zinc-800 disabled:opacity-40 transition shrink-0 shadow-xs"
                >
                  <Plus :size="14" />
                  <span>Tambah</span>
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            @click="calculatePortfolio"
            :disabled="isLoading"
            class="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-950 py-3 text-xs font-extrabold text-white transition hover:bg-zinc-800 shadow-md disabled:opacity-50"
          >
            <Loader2 v-if="isLoading" :size="15" class="animate-spin" />
            <span v-else>Kalkulasi Diversifikasi Lahan</span>
          </button>
        </div>
      </div>

      <!-- Right Column: Portfolio Simulation Output -->
      <div class="lg:col-span-7 space-y-6">
        <template v-if="portfolioResult">
          <!-- 3D MULTI-CROP PORTFOLIO DIGITAL TWIN -->
          <div class="space-y-2">
            <div class="flex items-center justify-between px-1">
              <div class="flex items-center gap-2">
                <span class="rounded bg-zinc-950 px-2 py-0.5 font-mono text-[10px] font-bold text-white uppercase">
                  3D Digital Twin
                </span>
                <span class="text-xs font-bold text-zinc-900 font-mono">Simulasi Zonasi Polikultur 3D</span>
              </div>
              <span class="text-[10px] font-mono text-zinc-500">Drag untuk putar • Hover blok tanaman</span>
            </div>

            <DigitalTwinPortfolioField :data="portfolio3dData" />
          </div>

          <!-- Overview Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="rounded-2xl border border-zinc-300 bg-white p-5 shadow-clean-sm">
              <span class="text-[10px] font-mono uppercase text-zinc-400 font-bold block">Skor Tertimbang DSS</span>
              <span class="mt-2 block font-mono text-4xl font-extrabold text-zinc-950">
                {{ portfolioResult.weighted_total_score }}
              </span>
              <span class="text-[11px] font-mono text-zinc-500">/ 100 (Indeks Keseluruhan)</span>
            </div>

            <div class="rounded-2xl border border-zinc-300 bg-white p-5 shadow-clean-sm">
              <span class="text-[10px] font-mono uppercase text-zinc-400 font-bold block">Indeks Diversifikasi</span>
              <span class="mt-2 block font-mono text-4xl font-extrabold text-zinc-950">
                {{ portfolioResult.diversification_index }}
              </span>
              <span class="text-[11px] font-mono text-zinc-500">Skala HHI Ketahanan (0-100)</span>
            </div>

            <div class="rounded-2xl border border-zinc-300 bg-white p-5 shadow-clean-sm">
              <span class="text-[10px] font-mono uppercase text-zinc-400 font-bold block">Kebutuhan Air Gabungan</span>
              <span class="mt-2 block font-mono text-3xl font-extrabold text-zinc-950">
                {{ portfolioResult.composite_water_demand_total_m3.toLocaleString('id-ID') }}
              </span>
              <span class="text-[11px] font-mono text-zinc-500">m³ Total Kebutuhan</span>
            </div>
          </div>

          <!-- Diversification Visual Allocation Bar -->
          <div class="rounded-2xl border border-zinc-300 bg-white p-6 shadow-clean-md space-y-4">
            <h3 class="text-xs font-bold uppercase tracking-wider text-zinc-950 flex items-center gap-2">
              <Layers :size="16" />
              <span>Komposisi Portofolio Lahan</span>
            </h3>

            <!-- Segmented Stacked Bar -->
            <div class="h-6 w-full rounded-xl bg-zinc-200 overflow-hidden flex border border-zinc-300">
              <div
                v-for="(alloc, idx) in portfolioResult.allocations"
                :key="alloc.crop_slug"
                class="h-full transition-all duration-300 flex items-center justify-center font-mono text-[10px] font-bold text-white overflow-hidden"
                :class="getSegmentColor(idx)"
                :style="{ width: `${alloc.percentage}%` }"
                :title="`${alloc.crop_name}: ${alloc.percentage}%`"
              >
                <span v-if="alloc.percentage >= 15">{{ alloc.crop_name.split(' ')[0] }} {{ alloc.percentage }}%</span>
              </div>
            </div>

            <!-- Allocation Details List -->
            <div class="divide-y divide-zinc-200 pt-2 font-mono text-xs">
              <div
                v-for="alloc in portfolioResult.allocations"
                :key="alloc.crop_slug"
                class="py-3 flex items-center justify-between"
              >
                <div>
                  <span class="font-bold text-zinc-900 block">{{ alloc.crop_name }}</span>
                  <span class="text-[11px] text-zinc-500">Alokasi: {{ alloc.allocated_area_m2.toLocaleString('id-ID') }} m² ({{ alloc.percentage }}%)</span>
                </div>
                <div class="text-right">
                  <span class="font-bold text-zinc-950 block">Skor: {{ alloc.individual_score }}/100</span>
                  <span class="text-[11px] text-zinc-500">Kontribusi Risiko: {{ alloc.risk_contribution.toFixed(1) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Strategic Advice Banner -->
          <div class="rounded-2xl border-2 border-zinc-950 bg-zinc-950 p-6 text-white shadow-clean-md">
            <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
              <Sparkles :size="15" />
              <span>Rekomendasi Portofolio Strategis:</span>
            </div>
            <p class="text-xs sm:text-sm text-zinc-200 leading-relaxed">
              {{ portfolioResult.recommendation_note }}
            </p>
            <div class="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>Keuntungan Reduksi Risiko vs Monokultur Terburuk:</span>
              <span class="font-bold text-white text-sm">+{{ portfolioResult.risk_reduction_benefit_pct }}%</span>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Maximize2, PieChart, Layers, Sparkles, Loader2, Plus, Trash2 } from '@lucide/vue'
import DigitalTwinPortfolioField from '~/components/digital-twin/DigitalTwinPortfolioField.vue'
import type { PortfolioSimulationResult } from '~/types/simulation'
import type { PortfolioDigitalTwinData } from '~/components/digital-twin/types'
import type { Crop } from '~/types/crop'

definePageMeta({
  middleware: 'auth'
})

const { fetchCrops } = useSimulation()

const totalArea = ref(10000) // 1 Hektar (10.000 m²)
const isLoading = ref(false)
const portfolioResult = ref<PortfolioSimulationResult | null>(null)
const allDbCrops = ref<Crop[]>([])
const selectedCropSlugToAdd = ref('')

const areaPresets = [
  { label: '0.25 Ha', value: 2500 },
  { label: '0.5 Ha', value: 5000 },
  { label: '1 Ha', value: 10000 },
  { label: '2 Ha', value: 20000 },
  { label: '5 Ha', value: 50000 }
]

const setArea = (val: number) => {
  totalArea.value = val
  calculatePortfolio()
}

const allocations = ref([
  { crop_slug: 'padi', crop_name: 'Padi Sawah', percentage: 60 },
  { crop_slug: 'jagung', crop_name: 'Jagung Hibrida', percentage: 40 }
])

const availableCropsToAdd = computed(() => {
  const currentSlugs = new Set(allocations.value.map(a => a.crop_slug))
  return allDbCrops.value.filter(c => !currentSlugs.has(c.slug))
})

const addSelectedCrop = () => {
  if (!selectedCropSlugToAdd.value) return
  const crop = allDbCrops.value.find(c => c.slug === selectedCropSlugToAdd.value)
  if (!crop) return

  allocations.value.push({
    crop_slug: crop.slug,
    crop_name: crop.name,
    percentage: 20
  })

  selectedCropSlugToAdd.value = ''
  balanceAllocations()
}

const removeCrop = (slug: string) => {
  allocations.value = allocations.value.filter(a => a.crop_slug !== slug)
  balanceAllocations()
}

const balanceAllocations = () => {
  if (allocations.value.length === 0) return
  const count = allocations.value.length
  const base = Math.floor(100 / count / 5) * 5
  let remainder = 100 - base * count

  allocations.value.forEach((item, idx) => {
    item.percentage = base + (idx === 0 ? remainder : 0)
  })

  calculatePortfolio()
}

const portfolio3dData = computed<PortfolioDigitalTwinData | null>(() => {
  if (!portfolioResult.value) return null
  return {
    allocations: portfolioResult.value.allocations,
    totalArea: totalArea.value,
    weightedTotalScore: portfolioResult.value.weighted_total_score,
    diversificationIndex: portfolioResult.value.diversification_index,
    compositeWaterDemandTotalM3: portfolioResult.value.composite_water_demand_total_m3,
    riskReductionBenefitPct: portfolioResult.value.risk_reduction_benefit_pct,
    locationName: 'Sidoarjo',
    plantingDate: new Date().toISOString().split('T')[0]
  }
})

const totalPercentage = computed(() => {
  return allocations.value.reduce((acc, curr) => acc + curr.percentage, 0)
})

const getCropBadgeColor = (slug: string) => {
  if (slug.includes('padi')) return 'bg-emerald-500'
  if (slug.includes('jagung')) return 'bg-amber-400'
  if (slug.includes('kedelai')) return 'bg-lime-500'
  if (slug.includes('cabai')) return 'bg-red-500'
  if (slug.includes('bawang')) return 'bg-purple-500'
  if (slug.includes('tomat')) return 'bg-rose-500'
  if (slug.includes('kentang')) return 'bg-yellow-600'
  if (slug.includes('tebu')) return 'bg-emerald-700'
  return 'bg-blue-500'
}

const getSegmentColor = (idx: number) => {
  if (idx === 0) return 'bg-zinc-950'
  if (idx === 1) return 'bg-zinc-700'
  if (idx === 2) return 'bg-zinc-500'
  if (idx === 3) return 'bg-zinc-400'
  return 'bg-zinc-300'
}

const applyPreset = (type: 'monoculture' | 'duoculture' | 'triculture' | 'horticulture') => {
  if (type === 'monoculture') {
    allocations.value = [
      { crop_slug: 'padi', crop_name: 'Padi Sawah', percentage: 100 }
    ]
  } else if (type === 'duoculture') {
    allocations.value = [
      { crop_slug: 'padi', crop_name: 'Padi Sawah', percentage: 70 },
      { crop_slug: 'jagung', crop_name: 'Jagung Hibrida', percentage: 30 }
    ]
  } else if (type === 'triculture') {
    allocations.value = [
      { crop_slug: 'padi', crop_name: 'Padi Sawah', percentage: 50 },
      { crop_slug: 'jagung', crop_name: 'Jagung Hibrida', percentage: 30 },
      { crop_slug: 'kedelai', crop_name: 'Kedelai', percentage: 20 }
    ]
  } else if (type === 'horticulture') {
    allocations.value = [
      { crop_slug: 'padi', crop_name: 'Padi Sawah', percentage: 40 },
      { crop_slug: 'cabai-merah', crop_name: 'Cabai Merah Keriting', percentage: 30 },
      { crop_slug: 'bawang-merah', crop_name: 'Bawang Merah', percentage: 30 }
    ]
  }
  calculatePortfolio()
}

const calculatePortfolio = async () => {
  isLoading.value = true
  try {
    const res = await $fetch<PortfolioSimulationResult>('/api/portfolio', {
      method: 'POST',
      body: {
        allocations: allocations.value.filter(a => a.percentage > 0),
        planting_date: new Date().toISOString().split('T')[0],
        total_area: totalArea.value,
        location_name: 'Sidoarjo',
        latitude: -7.4478,
        longitude: 112.7183
      }
    })
    portfolioResult.value = res
  } catch (err) {
    console.error('Portfolio simulation error:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  const crops = await fetchCrops()
  if (crops && crops.length > 0) {
    allDbCrops.value = crops
  }
  calculatePortfolio()
})
</script>
