<template>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
      <div>
        <div class="flex items-center gap-2">
          <span class="rounded bg-zinc-950 px-2 py-0.5 font-mono text-[10px] font-bold text-white uppercase">
            History Log
          </span>
          <span class="text-xs font-mono text-zinc-500">Rekam Jejak Simulasi Tersimpan</span>
        </div>
        <h1 class="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 uppercase">
          Riwayat Simulasi
        </h1>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="savedSimulations.length > 0"
          type="button"
          @click="confirmClearAll"
          class="rounded-xl border border-zinc-300 px-3.5 py-2 text-xs font-bold text-zinc-700 transition hover:bg-zinc-100"
        >
          Hapus Semua
        </button>
        <NuxtLink
          to="/simulate"
          class="flex items-center gap-1.5 rounded-xl bg-zinc-950 px-4 py-2 text-xs font-bold text-white transition hover:bg-zinc-800 shadow-sm"
        >
          <Plus :size="15" />
          <span>Buat Simulasi Baru</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="isLoadingHistory" class="flex flex-col items-center py-16 gap-3 text-zinc-400">
      <Loader2 :size="32" class="animate-spin text-zinc-950" />
      <span class="font-mono text-xs text-zinc-600">Memuat riwayat dari Supabase...</span>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="savedSimulations.length === 0"
      class="rounded-3xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-12 text-center"
    >
      <History :size="40" class="mx-auto text-zinc-400" />
      <h3 class="mt-4 text-base font-bold text-zinc-950">Belum Ada Riwayat Simulasi Tersimpan</h3>
      <p class="mt-1 text-xs text-zinc-500 max-w-md mx-auto">
        Jalankan simulasi keputusan di Simulation Studio lalu klik "Simpan Simulasi ke Supabase" untuk menyimpannya di sini.
      </p>
      <div class="mt-6">
        <NuxtLink
          to="/simulate"
          class="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-zinc-800 shadow-sm"
        >
          <span>Buka Simulation Studio</span>
          <ArrowRight :size="15" />
        </NuxtLink>
      </div>
    </div>

    <!-- Saved Simulations Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="sc in savedSimulations"
        :key="sc.id"
        class="group rounded-2xl border border-zinc-300 bg-white p-6 shadow-clean-sm flex flex-col justify-between hover:shadow-clean-md hover:border-zinc-400 transition"
      >
        <div>
          <!-- Card Header: location & score -->
          <div class="flex items-start justify-between gap-2 border-b border-zinc-200 pb-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5 mb-1">
                <MapPin :size="11" class="text-zinc-400 shrink-0" />
                <span class="text-[10px] font-mono text-zinc-500 truncate uppercase">
                  {{ sc.location_name }}
                </span>
              </div>
              <h3 class="text-base font-extrabold text-zinc-950 leading-tight">{{ sc.crop.name }}</h3>
              <span class="text-[10px] font-mono text-zinc-400">Tanaman: {{ sc.crop.category }}</span>
            </div>
            <div class="text-right shrink-0">
              <span class="font-mono text-2xl font-extrabold text-zinc-950">{{ sc.risk_breakdown.total_score }}</span>
              <span class="block text-[10px] font-mono text-zinc-400">DSS Skor / 100</span>
            </div>
          </div>

          <!-- Simulation Parameters -->
          <div class="mt-3 space-y-1.5 font-mono text-xs text-zinc-700">
            <div class="flex justify-between items-center">
              <span class="flex items-center gap-1 text-zinc-500">
                <Calendar :size="10" />
                <span>Tanggal Tanam:</span>
              </span>
              <span class="font-bold text-zinc-950">{{ formatDate(sc.planting_date) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="flex items-center gap-1 text-zinc-500">
                <Maximize2 :size="10" />
                <span>Luas Lahan:</span>
              </span>
              <span class="font-bold text-zinc-950">{{ sc.land_area.toLocaleString('id-ID') }} m²</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-zinc-500">Koordinat:</span>
              <span class="font-bold text-zinc-950 text-[10px]">{{ sc.latitude?.toFixed(4) }}, {{ sc.longitude?.toFixed(4) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-zinc-500">Rekomendasi:</span>
              <span class="font-bold text-zinc-950 text-right max-w-[130px] leading-tight">{{ sc.risk_breakdown.recommendation }}</span>
            </div>
            <div v-if="sc.created_at" class="flex justify-between">
              <span class="text-zinc-500">Disimpan:</span>
              <span class="text-zinc-600 font-medium">{{ formatDateTime(sc.created_at) }}</span>
            </div>
          </div>

          <!-- Mini 4-factor scores -->
          <div class="mt-3 pt-3 border-t border-zinc-200 grid grid-cols-4 gap-1.5 text-center font-mono text-[10px]">
            <div class="rounded bg-zinc-50 p-1.5 border border-zinc-200">
              <span class="block text-[8px] text-zinc-400 uppercase">Cuaca</span>
              <span class="font-bold text-zinc-900">{{ sc.risk_breakdown.weather_risk.score }}</span>
            </div>
            <div class="rounded bg-zinc-50 p-1.5 border border-zinc-200">
              <span class="block text-[8px] text-zinc-400 uppercase">Air</span>
              <span class="font-bold text-zinc-900">{{ sc.risk_breakdown.water_risk.score }}</span>
            </div>
            <div class="rounded bg-zinc-50 p-1.5 border border-zinc-200">
              <span class="block text-[8px] text-zinc-400 uppercase">Kesesuaian</span>
              <span class="font-bold text-zinc-900">{{ sc.risk_breakdown.crop_suitability_risk.score }}</span>
            </div>
            <div class="rounded bg-zinc-50 p-1.5 border border-zinc-200">
              <span class="block text-[8px] text-zinc-400 uppercase">Ekonomi</span>
              <span class="font-bold text-zinc-900">{{ sc.risk_breakdown.economic_risk.score }}</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-5 pt-3 border-t border-zinc-200 space-y-2">
          <!-- Primary: Load into Studio -->
          <button
            type="button"
            @click="handleLoadIntoStudio(sc)"
            class="w-full flex items-center justify-center gap-1.5 rounded-xl bg-zinc-950 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-zinc-800"
          >
            <Sliders :size="13" />
            <span>Muat ke Studio (Isi Otomatis Form)</span>
          </button>

          <!-- Secondary row -->
          <div class="flex gap-2">
            <button
              type="button"
              @click="addToCompareList(sc)"
              class="flex-1 rounded-xl border border-zinc-300 bg-white px-3 py-1.5 text-xs font-bold text-zinc-800 transition hover:bg-zinc-100"
            >
              + Komparasi
            </button>

            <button
              type="button"
              @click="handleDelete(sc)"
              class="flex items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-100"
              :disabled="deletingId === sc.id"
            >
              <Loader2 v-if="deletingId === sc.id" :size="13" class="animate-spin" />
              <Trash2 v-else :size="13" />
              <span>Hapus</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirm Modal -->
    <div
      v-if="confirmDeleteTarget"
      class="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 backdrop-blur-sm p-4"
      @click.self="confirmDeleteTarget = null"
    >
      <div class="w-full max-w-md rounded-2xl border border-zinc-300 bg-white p-6 shadow-2xl space-y-4">
        <div class="flex items-center gap-3 border-b border-zinc-200 pb-4">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-600">
            <Trash2 :size="18" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-zinc-950">Hapus Simulasi?</h3>
            <p class="text-xs text-zinc-500">Tindakan ini tidak dapat dibatalkan</p>
          </div>
        </div>

        <div class="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 font-mono text-xs space-y-1">
          <div class="font-bold text-zinc-950">{{ confirmDeleteTarget.crop.name }}</div>
          <div class="text-zinc-500">{{ confirmDeleteTarget.location_name }}</div>
          <div class="text-zinc-500">Tanggal Tanam: {{ confirmDeleteTarget.planting_date }}</div>
        </div>

        <div class="flex gap-2">
          <button
            type="button"
            @click="confirmDeleteTarget = null"
            class="flex-1 rounded-xl border border-zinc-300 py-2.5 text-xs font-bold text-zinc-800 hover:bg-zinc-100 transition"
          >
            Batal
          </button>
          <button
            type="button"
            @click="executeDelete"
            class="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white hover:bg-red-700 transition"
          >
            Ya, Hapus Simulasi
          </button>
        </div>
      </div>
    </div>

    <!-- Clear All Confirm Modal -->
    <div
      v-if="showClearAllConfirm"
      class="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 backdrop-blur-sm p-4"
      @click.self="showClearAllConfirm = false"
    >
      <div class="w-full max-w-sm rounded-2xl border border-zinc-300 bg-white p-6 shadow-2xl space-y-4">
        <h3 class="text-sm font-bold text-zinc-950">Hapus Semua Riwayat?</h3>
        <p class="text-xs text-zinc-500">Akan menghapus {{ savedSimulations.length }} simulasi tersimpan dari lokal. Data di Supabase tidak terpengaruh.</p>
        <div class="flex gap-2">
          <button @click="showClearAllConfirm = false" class="flex-1 rounded-xl border border-zinc-300 py-2.5 text-xs font-bold text-zinc-800 hover:bg-zinc-100 transition">Batal</button>
          <button @click="executeClearAll" class="flex-1 rounded-xl bg-zinc-950 py-2.5 text-xs font-bold text-white hover:bg-zinc-800 transition">Ya, Hapus Semua</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { History, Plus, ArrowRight, Sliders, Trash2, MapPin, Calendar, Maximize2, Loader2 } from '@lucide/vue'
import type { ScenarioResult } from '~/types/simulation'

definePageMeta({
  middleware: 'auth'
})

const { savedSimulations, addToComparison, loadSavedHistory, deleteSimulation, loadIntoStudio } = useSimulation()

const isLoadingHistory = ref(false)
const deletingId = ref<string | null>(null)
const confirmDeleteTarget = ref<ScenarioResult | null>(null)
const showClearAllConfirm = ref(false)

// Load into studio — restore ALL form parameters
const handleLoadIntoStudio = (sc: ScenarioResult) => {
  loadIntoStudio(sc as any)
}

const addToCompareList = (sc: ScenarioResult) => {
  addToComparison(sc)
  navigateTo('/compare')
}

const handleDelete = (sc: ScenarioResult) => {
  confirmDeleteTarget.value = sc
}

const executeDelete = async () => {
  if (!confirmDeleteTarget.value) return
  deletingId.value = confirmDeleteTarget.value.id
  await deleteSimulation(confirmDeleteTarget.value as any)
  deletingId.value = null
  confirmDeleteTarget.value = null
}

const confirmClearAll = () => {
  showClearAllConfirm.value = true
}

const executeClearAll = () => {
  savedSimulations.value = []
  if (import.meta.client) {
    localStorage.removeItem('taniaman_saved_simulations')
  }
  showClearAllConfirm.value = false
}

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return dateStr
  }
}

const formatDateTime = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return dateStr
  }
}

onMounted(async () => {
  isLoadingHistory.value = true
  await loadSavedHistory()
  isLoadingHistory.value = false
})
</script>
