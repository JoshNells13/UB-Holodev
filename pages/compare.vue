<template>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
      <div>
        <div class="flex items-center gap-2">
          <span class="rounded bg-zinc-950 px-2 py-0.5 font-mono text-[10px] font-bold text-white uppercase">
            Multi-Scenario Matrix
          </span>
          <span class="text-xs font-mono text-zinc-500">Komparasi Keputusan Pertanian</span>
        </div>
        <h1 class="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 uppercase">
          Komparasi Skenario
        </h1>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          v-if="comparisonList.length > 0"
          type="button"
          @click="clearComparison"
          class="rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs font-bold text-zinc-700 transition hover:bg-zinc-100"
        >
          Bersihkan Semua
        </button>

        <NuxtLink
          to="/simulate"
          class="flex items-center gap-1.5 rounded-xl bg-zinc-950 px-4 py-2 text-xs font-bold text-white transition hover:bg-zinc-800 shadow-sm"
        >
          <Plus :size="15" />
          <span>Buat Skenario Baru</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="comparisonList.length === 0"
      class="rounded-3xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-12 text-center"
    >
      <Scale :size="40" class="mx-auto text-zinc-400" />
      <h3 class="mt-4 text-base font-bold text-zinc-950">Belum Ada Skenario dalam Matriks Komparasi</h3>
      <p class="mt-1 text-xs text-zinc-500 max-w-md mx-auto">
        Tambahkan minimal 2 skenario dari halaman Simulasi atau gunakan tombol pintas otomatis di bawah ini untuk menguji variasi keputusan.
      </p>
      <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          @click="generateSampleScenarios"
          :disabled="isLoading"
          class="flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-zinc-800 shadow-sm disabled:opacity-50"
        >
          <Loader2 v-if="isLoading" :size="15" class="animate-spin" />
          <Zap v-else :size="15" />
          <span>Muat 3 Contoh Skenario Standar PRD</span>
        </button>
      </div>
    </div>

    <template v-else>
      <!-- Best Scenario Winner Banner (PRD Section 8.8) -->
      <div v-if="bestScenario" class="rounded-3xl border-2 border-zinc-950 bg-white p-6 sm:p-8 shadow-clean-lg">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div class="space-y-3">
            <div class="inline-flex items-center gap-2 rounded-full border border-zinc-950 bg-zinc-950 px-3 py-1 text-xs font-bold text-white">
              <Award :size="15" />
              <span>SKENARIO TERBAIK TERPILIH (BEST DECISION)</span>
            </div>

            <h2 class="text-2xl sm:text-3xl font-extrabold text-zinc-950">
              {{ bestScenario.crop.name }} — {{ formatDate(bestScenario.planting_date) }}
            </h2>

            <p class="text-xs sm:text-sm text-zinc-600 max-w-2xl leading-relaxed">
              {{ bestScenario.risk_breakdown.summary_reason }}
            </p>

            <div class="flex flex-wrap items-center gap-4 pt-1 font-mono text-xs text-zinc-700">
              <span>Lokasi: <strong>{{ bestScenario.location_name }}</strong></span>
              <span>•</span>
              <span>Luas: <strong>{{ bestScenario.land_area.toLocaleString('id-ID') }} m²</strong></span>
              <span>•</span>
              <span>Rekomendasi: <strong>{{ bestScenario.risk_breakdown.recommendation }}</strong></span>
            </div>
          </div>

          <div class="flex items-center gap-4 lg:border-l lg:border-zinc-200 lg:pl-8">
            <div class="text-right">
              <span class="block text-[10px] font-mono uppercase text-zinc-400 font-bold">Skor DSS</span>
              <span class="font-mono text-4xl sm:text-5xl font-extrabold text-zinc-950">
                {{ bestScenario.risk_breakdown.total_score }}
              </span>
              <span class="block text-[10px] font-mono text-zinc-500">/ 100</span>
            </div>
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-white">
              <CheckCircle2 :size="24" />
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Add Comparison Variations -->
      <div class="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 flex flex-wrap items-center justify-between gap-3">
        <span class="text-xs font-bold text-zinc-900 font-mono flex items-center gap-1.5">
          <PlusCircle :size="15" />
          <span>Tambah Variasi Cepat:</span>
        </span>
        <div class="flex flex-wrap items-center gap-2">
          <button
            @click="addOffsetScenario(14)"
            class="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 hover:border-zinc-950 hover:bg-zinc-950 hover:text-white transition"
          >
            + Tunda 14 Hari (Tanggal Sama)
          </button>
          <button
            @click="addAlternativeCropScenario('jagung')"
            class="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 hover:border-zinc-950 hover:bg-zinc-950 hover:text-white transition"
          >
            + Tanaman Jagung Hibrida
          </button>
          <button
            @click="addAlternativeCropScenario('kedelai')"
            class="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 hover:border-zinc-950 hover:bg-zinc-950 hover:text-white transition"
          >
            + Tanaman Kedelai
          </button>
        </div>
      </div>

      <!-- Comparison Matrix Table -->
      <div class="rounded-2xl border border-zinc-300 bg-white overflow-hidden shadow-clean-md">
        <div class="p-5 border-b border-zinc-200 bg-zinc-50/50">
          <h3 class="text-xs font-extrabold uppercase tracking-wider text-zinc-950">Matriks Evaluasi Parameter (Side-by-Side)</h3>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-zinc-200 font-mono text-[11px] text-zinc-500 uppercase bg-zinc-50">
                <th class="py-3 px-4 w-48">Parameter Evaluasi</th>
                <th
                  v-for="(sc, idx) in comparisonList"
                  :key="sc.id"
                  class="py-3 px-4 min-w-[200px]"
                  :class="sc.id === bestScenario?.id ? 'bg-zinc-100 font-bold text-zinc-950 border-x border-zinc-300' : ''"
                >
                  <div class="flex items-center justify-between">
                    <span>Skenario {{ String.fromCharCode(65 + idx) }}</span>
                    <button
                      type="button"
                      @click="removeFromComparison(sc.id)"
                      class="text-zinc-400 hover:text-red-600 transition"
                      title="Hapus"
                    >
                      <Trash2 :size="13" />
                    </button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-200 font-mono">
              <tr>
                <td class="py-3 px-4 font-bold text-zinc-900 bg-zinc-50/50">Komoditas Tanaman</td>
                <td
                  v-for="sc in comparisonList"
                  :key="sc.id"
                  class="py-3 px-4 font-bold"
                  :class="sc.id === bestScenario?.id ? 'bg-zinc-100/50 text-zinc-950 border-x border-zinc-300' : 'text-zinc-800'"
                >
                  {{ sc.crop.name }}
                </td>
              </tr>
              <tr>
                <td class="py-3 px-4 font-bold text-zinc-900 bg-zinc-50/50">Tanggal Tanam</td>
                <td
                  v-for="sc in comparisonList"
                  :key="sc.id"
                  class="py-3 px-4"
                  :class="sc.id === bestScenario?.id ? 'bg-zinc-100/50 font-bold text-zinc-950 border-x border-zinc-300' : 'text-zinc-700'"
                >
                  {{ sc.planting_date }}
                </td>
              </tr>
              <tr>
                <td class="py-3 px-4 font-bold text-zinc-900 bg-zinc-50/50">Weather Risk</td>
                <td
                  v-for="sc in comparisonList"
                  :key="sc.id"
                  class="py-3 px-4"
                  :class="sc.id === bestScenario?.id ? 'bg-zinc-100/50 font-bold border-x border-zinc-300' : ''"
                >
                  <span class="rounded px-2 py-0.5 text-[10px] font-bold border" :class="getRiskBadge(sc.risk_breakdown.weather_risk.risk_level)">
                    {{ sc.risk_breakdown.weather_risk.risk_level }} (Skor: {{ sc.risk_breakdown.weather_risk.score }})
                  </span>
                </td>
              </tr>
              <tr>
                <td class="py-3 px-4 font-bold text-zinc-900 bg-zinc-50/50">Water Risk</td>
                <td
                  v-for="sc in comparisonList"
                  :key="sc.id"
                  class="py-3 px-4"
                  :class="sc.id === bestScenario?.id ? 'bg-zinc-100/50 font-bold border-x border-zinc-300' : ''"
                >
                  <span class="rounded px-2 py-0.5 text-[10px] font-bold border" :class="getRiskBadge(sc.risk_breakdown.water_risk.risk_level)">
                    {{ sc.risk_breakdown.water_risk.risk_level }} (Skor: {{ sc.risk_breakdown.water_risk.score }})
                  </span>
                </td>
              </tr>
              <tr>
                <td class="py-3 px-4 font-bold text-zinc-900 bg-zinc-50/50">Crop Suitability</td>
                <td
                  v-for="sc in comparisonList"
                  :key="sc.id"
                  class="py-3 px-4"
                  :class="sc.id === bestScenario?.id ? 'bg-zinc-100/50 font-bold border-x border-zinc-300' : ''"
                >
                  <span class="font-bold">{{ sc.risk_breakdown.crop_suitability_risk.score }} / 100</span>
                </td>
              </tr>
              <tr>
                <td class="py-3 px-4 font-bold text-zinc-900 bg-zinc-50/50">Economic Risk</td>
                <td
                  v-for="sc in comparisonList"
                  :key="sc.id"
                  class="py-3 px-4"
                  :class="sc.id === bestScenario?.id ? 'bg-zinc-100/50 font-bold border-x border-zinc-300' : ''"
                >
                  <span class="rounded px-2 py-0.5 text-[10px] font-bold border" :class="getRiskBadge(sc.risk_breakdown.economic_risk.risk_level)">
                    {{ sc.risk_breakdown.economic_risk.risk_level }} (Skor: {{ sc.risk_breakdown.economic_risk.score }})
                  </span>
                </td>
              </tr>
              <tr class="bg-zinc-50">
                <td class="py-4 px-4 font-extrabold text-zinc-950 text-sm">TOTAL SKOR DSS</td>
                <td
                  v-for="sc in comparisonList"
                  :key="sc.id"
                  class="py-4 px-4 font-mono text-base font-extrabold"
                  :class="sc.id === bestScenario?.id ? 'bg-zinc-950 text-white border-x border-zinc-950' : 'text-zinc-950'"
                >
                  {{ sc.risk_breakdown.total_score }} / 100
                </td>
              </tr>
              <tr>
                <td class="py-3 px-4 font-bold text-zinc-900 bg-zinc-50/50">Status Rekomendasi</td>
                <td
                  v-for="sc in comparisonList"
                  :key="sc.id"
                  class="py-3 px-4 font-bold"
                  :class="sc.id === bestScenario?.id ? 'bg-zinc-100/50 text-zinc-950 border-x border-zinc-300' : 'text-zinc-700'"
                >
                  {{ sc.risk_breakdown.recommendation }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Scenario Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ScenarioCard
          v-for="sc in comparisonList"
          :key="sc.id"
          :scenario="sc"
          :isBest="sc.id === bestScenario?.id"
          :canRemove="true"
          @remove="removeFromComparison"
          @select="selectScenarioDetail"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Scale,
  Plus,
  Zap,
  Award,
  CheckCircle2,
  PlusCircle,
  Trash2,
  Loader2
} from '@lucide/vue'
import ScenarioCard from '~/components/simulator/ScenarioCard.vue'
import type { ScenarioResult } from '~/types/simulation'
import type { RiskLevel } from '~/types/risk'

definePageMeta({
  middleware: 'auth'
})

const {
  comparisonList,
  currentScenario,
  runSimulation,
  removeFromComparison,
  clearComparison,
  isLoading
} = useSimulation()

const bestScenario = computed<ScenarioResult | null>(() => {
  if (comparisonList.value.length === 0) return null
  return [...comparisonList.value].sort((a, b) => b.risk_breakdown.total_score - a.risk_breakdown.total_score)[0]
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

const getRiskBadge = (level: RiskLevel) => {
  if (level === 'LOW') return 'bg-zinc-100 text-zinc-900 border-zinc-300'
  if (level === 'MEDIUM') return 'bg-zinc-200 text-zinc-950 border-zinc-400'
  return 'bg-zinc-900 text-white border-zinc-950'
}

const selectScenarioDetail = (sc: ScenarioResult) => {
  currentScenario.value = sc
  navigateTo('/simulate')
}

const addOffsetScenario = async (days: number) => {
  const base = currentScenario.value || comparisonList.value[0]
  if (!base) return

  const d = new Date(base.planting_date)
  d.setDate(d.getDate() + days)
  const newDate = d.toISOString().split('T')[0]

  const sc = await runSimulation({
    location_name: base.location_name,
    latitude: base.latitude,
    longitude: base.longitude,
    crop_slug: base.crop.slug,
    planting_date: newDate,
    land_area: base.land_area,
    is_baseline: false
  })

  comparisonList.value.push({ ...sc, id: 'sc_' + Math.random().toString(36).substring(2, 9) })
}

const addAlternativeCropScenario = async (slug: string) => {
  const base = currentScenario.value || comparisonList.value[0]
  const locationName = base?.location_name || 'Sidoarjo'
  const lat = base?.latitude || -7.4478
  const lon = base?.longitude || 112.7183
  const date = base?.planting_date || new Date().toISOString().split('T')[0]

  const sc = await runSimulation({
    location_name: locationName,
    latitude: lat,
    longitude: lon,
    crop_slug: slug,
    planting_date: date,
    land_area: 1000,
    is_baseline: false
  })

  comparisonList.value.push({ ...sc, id: 'sc_' + Math.random().toString(36).substring(2, 9) })
}

const generateSampleScenarios = async () => {
  clearComparison()
  
  // Scenario A: Padi on Oct 1
  const scA = await runSimulation({
    location_name: 'Sidoarjo',
    latitude: -7.4478,
    longitude: 112.7183,
    crop_slug: 'padi',
    planting_date: '2026-10-01',
    land_area: 1000,
    is_baseline: true
  })
  comparisonList.value.push({ ...scA, id: 'sc_a' })

  // Scenario B: Padi on Oct 15
  const scB = await runSimulation({
    location_name: 'Sidoarjo',
    latitude: -7.4478,
    longitude: 112.7183,
    crop_slug: 'padi',
    planting_date: '2026-10-15',
    land_area: 1000,
    is_baseline: false
  })
  comparisonList.value.push({ ...scB, id: 'sc_b' })

  // Scenario C: Jagung on Oct 01
  const scC = await runSimulation({
    location_name: 'Sidoarjo',
    latitude: -7.4478,
    longitude: 112.7183,
    crop_slug: 'jagung',
    planting_date: '2026-10-01',
    land_area: 1000,
    is_baseline: false
  })
  comparisonList.value.push({ ...scC, id: 'sc_c' })
}
</script>
