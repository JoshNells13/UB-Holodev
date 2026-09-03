<template>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
      <div>
        <div class="flex items-center gap-2">
          <span class="rounded bg-zinc-950 px-2 py-0.5 font-mono text-[10px] font-bold text-white uppercase">
            Diversification Engine
          </span>
          <span class="text-xs font-mono text-zinc-500">Mitigasi Risiko Monokultur</span>
        </div>
        <h1 class="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 uppercase">
          Simulator Portofolio Lahan
        </h1>
      </div>

      <!-- Total Area -->
      <div class="flex items-center gap-3 font-mono text-xs text-zinc-700 bg-zinc-100 px-4 py-2 rounded-xl border border-zinc-200">
        <Maximize2 :size="15" class="text-zinc-900" />
        <span>Total Luas Lahan: <strong>{{ totalArea.toLocaleString('id-ID') }} m²</strong> ({{ (totalArea / 10000).toFixed(1) }} Ha)</span>
      </div>
    </div>

    <!-- Workspace Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Left Column: Crop Allocation Sliders & Presets -->
      <div class="lg:col-span-5 space-y-6">
        <div class="rounded-2xl border-2 border-zinc-950 bg-zinc-50 p-6 shadow-clean-md space-y-5">
          <div class="flex items-center justify-between border-b border-zinc-200 pb-3">
            <h3 class="text-xs font-extrabold uppercase tracking-wider text-zinc-950 flex items-center gap-1.5">
              <PieChart :size="15" />
              <span>Alokasi Proporsi Komoditas</span>
            </h3>
            <span
              class="font-mono text-xs font-bold"
              :class="totalPercentage === 100 ? 'text-zinc-950' : 'text-red-600'"
            >
              Total: {{ totalPercentage }}%
            </span>
          </div>

          <!-- Preset Portfolios -->
          <div>
            <span class="text-[10px] font-mono uppercase text-zinc-500 block mb-2">Preset Portofolio Agroklimat:</span>
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                @click="applyPreset('monoculture')"
                class="rounded-lg border border-zinc-300 bg-white py-2 px-2 text-[11px] font-bold text-zinc-800 transition hover:border-zinc-950 hover:bg-zinc-950 hover:text-white text-center"
              >
                100% Padi
              </button>
              <button
                type="button"
                @click="applyPreset('duoculture')"
                class="rounded-lg border border-zinc-300 bg-white py-2 px-2 text-[11px] font-bold text-zinc-800 transition hover:border-zinc-950 hover:bg-zinc-950 hover:text-white text-center"
              >
                70% Padi + 30% Jagung
              </button>
              <button
                type="button"
                @click="applyPreset('triculture')"
                class="rounded-lg border border-zinc-300 bg-white py-2 px-2 text-[11px] font-bold text-zinc-800 transition hover:border-zinc-950 hover:bg-zinc-950 hover:text-white text-center"
              >
                50% Padi + 30% Jagung + 20% Kedelai
              </button>
            </div>
          </div>

          <!-- Allocation Sliders -->
          <div class="space-y-4 pt-2 border-t border-zinc-200">
            <div v-for="(item, idx) in allocations" :key="item.crop_slug" class="space-y-1.5">
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold text-zinc-950">{{ item.crop_name }}</span>
                <span class="font-mono font-bold text-zinc-900">{{ item.percentage }}% ({{ Math.round((item.percentage / 100) * totalArea).toLocaleString('id-ID') }} m²)</span>
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
import { Maximize2, PieChart, Layers, Sparkles, Loader2 } from '@lucide/vue'
import type { PortfolioSimulationResult } from '~/types/simulation'

definePageMeta({
  middleware: 'auth'
})

const totalArea = ref(10000) // 1 Hektar (10.000 m²)
const isLoading = ref(false)
const portfolioResult = ref<PortfolioSimulationResult | null>(null)

const allocations = ref([
  { crop_slug: 'padi', crop_name: 'Padi Sawah', percentage: 60 },
  { crop_slug: 'jagung', crop_name: 'Jagung Hibrida', percentage: 40 },
  { crop_slug: 'kedelai', crop_name: 'Kedelai', percentage: 0 }
])

const totalPercentage = computed(() => {
  return allocations.value.reduce((acc, curr) => acc + curr.percentage, 0)
})

const getSegmentColor = (idx: number) => {
  if (idx === 0) return 'bg-zinc-950'
  if (idx === 1) return 'bg-zinc-700'
  if (idx === 2) return 'bg-zinc-500'
  return 'bg-zinc-400'
}

const applyPreset = (type: 'monoculture' | 'duoculture' | 'triculture') => {
  if (type === 'monoculture') {
    allocations.value = [
      { crop_slug: 'padi', crop_name: 'Padi Sawah', percentage: 100 },
      { crop_slug: 'jagung', crop_name: 'Jagung Hibrida', percentage: 0 },
      { crop_slug: 'kedelai', crop_name: 'Kedelai', percentage: 0 }
    ]
  } else if (type === 'duoculture') {
    allocations.value = [
      { crop_slug: 'padi', crop_name: 'Padi Sawah', percentage: 70 },
      { crop_slug: 'jagung', crop_name: 'Jagung Hibrida', percentage: 30 },
      { crop_slug: 'kedelai', crop_name: 'Kedelai', percentage: 0 }
    ]
  } else if (type === 'triculture') {
    allocations.value = [
      { crop_slug: 'padi', crop_name: 'Padi Sawah', percentage: 50 },
      { crop_slug: 'jagung', crop_name: 'Jagung Hibrida', percentage: 30 },
      { crop_slug: 'kedelai', crop_name: 'Kedelai', percentage: 20 }
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

onMounted(() => {
  calculatePortfolio()
})
</script>
