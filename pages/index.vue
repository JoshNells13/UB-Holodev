<template>
  <div class="space-y-16 py-8 sm:py-16">
    <!-- Hero Section -->
    <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="relative overflow-hidden rounded-3xl border-2 border-zinc-950 bg-white p-8 sm:p-12 shadow-clean-lg">
        <!-- Background Grid Pattern -->
        <div class="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none"></div>

        <div class="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <!-- Left: Hero Headline -->
          <div class="lg:col-span-7 space-y-6 text-left">
            <div class="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-zinc-50 px-3 py-1 text-xs font-bold text-zinc-900 shadow-sm">
              <Sprout :size="15" class="text-zinc-950" />
              <span>Climate-Agricultural Decision Support System (DSS)</span>
            </div>

            <h1 class="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-950 uppercase leading-none">
              Simulasikan <br />
              <span class="underline decoration-zinc-400 underline-offset-8">Sebelum</span> Menanam.
            </h1>

            <p class="max-w-xl text-sm sm:text-base leading-relaxed text-zinc-600">
              Jangan hanya melihat prakiraan cuaca. Siap Tani mengintegrasikan data agroklimat, kalkulasi kebutuhan air, dan analisis risiko ekonomi menjadi simulasi keputusan pertanian yang dapat diuji secara virtual.
            </p>

            <!-- CTA Buttons -->
            <div class="flex flex-wrap items-center gap-3 pt-2">
              <button
                @click="startSimulation"
                class="flex items-center gap-2 rounded-xl bg-zinc-950 px-6 py-3.5 text-xs sm:text-sm font-extrabold text-white transition hover:bg-zinc-800 shadow-md"
              >
                <span>Mulai Simulasi Keputusan</span>
                <ArrowRight :size="16" />
              </button>

              <NuxtLink
                to="/crops"
                class="flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 py-3.5 text-xs sm:text-sm font-bold text-zinc-900 transition hover:bg-zinc-100"
              >
                <BookOpen :size="16" />
                <span>Katalog Tanaman</span>
              </NuxtLink>
            </div>

            <!-- Value Proposition Pills -->
            <div class="pt-4 border-t border-zinc-200 grid grid-cols-3 gap-3 font-mono text-xs text-zinc-700">
              <div>
                <span class="block text-[10px] text-zinc-400 uppercase font-bold">1. SIMULATE</span>
                <span class="font-bold">Uji Tanggal & Tanaman</span>
              </div>
              <div>
                <span class="block text-[10px] text-zinc-400 uppercase font-bold">2. COMPARE</span>
                <span class="font-bold">Komparasi Skenario</span>
              </div>
              <div>
                <span class="block text-[10px] text-zinc-400 uppercase font-bold">3. DECIDE</span>
                <span class="font-bold">Keputusan Berbasis Data</span>
              </div>
            </div>
          </div>

          <!-- Right: Interactive Quick Simulation Card -->
          <div class="lg:col-span-5">
            <div class="rounded-2xl border-2 border-zinc-950 bg-zinc-50 p-6 shadow-clean-md space-y-4">
              <div class="flex items-center justify-between border-b border-zinc-200 pb-3">
                <div class="flex items-center gap-2">
                  <div class="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-950 text-white">
                    <Sliders :size="16" />
                  </div>
                  <h3 class="text-xs font-extrabold uppercase tracking-wider text-zinc-950">Quick Simulation Launcher</h3>
                </div>
                <span class="rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] font-mono font-bold text-zinc-800">
                  Instant
                </span>
              </div>

              <!-- Quick Location -->
              <LocationSearch v-model="quickLocation" />

              <!-- Quick Crop -->
              <CropSelectModal v-model="quickCropSlug" />

              <!-- Quick Date -->
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5 flex items-center justify-between">
                  <span class="flex items-center gap-1.5">
                    <Calendar :size="14" class="text-zinc-900" />
                    <span>3. Tanggal Rencana Tanam</span>
                  </span>
                </label>
                <input
                  v-model="quickDate"
                  type="date"
                  class="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-xs font-semibold text-zinc-900 focus:border-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-950 shadow-sm"
                />
              </div>

              <!-- Submit -->
              <button
                @click="executeQuickSim"
                :disabled="isLoading"
                class="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-950 py-3 text-xs font-extrabold text-white transition hover:bg-zinc-800 shadow-md disabled:opacity-50"
              >
                <Loader2 v-if="isLoading" :size="16" class="animate-spin" />
                <span v-else>Jalankan Simulasi Agroklimat</span>
              </button>

              <p class="text-center text-[11px] text-zinc-500 font-mono">
                * Wajib masuk/daftar akun sebelum melihat hasil analisis
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Core DSS Pillars Section -->
    <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-2xl mx-auto mb-10">
        <h2 class="text-2xl sm:text-3xl font-extrabold text-zinc-950 uppercase tracking-tight">
          Arsitektur Keputusan Pertanian
        </h2>
        <p class="mt-2 text-xs sm:text-sm text-zinc-600">
          Siap Tani tidak hanya menyajikan data mentah cuaca, melainkan mengonversinya menjadi wawasan agronomi terukur.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Pillar 1 -->
        <div class="rounded-2xl border border-zinc-300 bg-white p-6 shadow-clean-sm space-y-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 text-white">
            <Sliders :size="20" />
          </div>
          <h3 class="text-sm font-extrabold text-zinc-950 uppercase">What-If Agricultural Simulation</h3>
          <p class="text-xs text-zinc-600 leading-relaxed">
            Eksplorasi skenario tanam secara fleksibel. Amati langsung perubahan skor dan penurunan risiko saat tanggal tanam dimajukan atau dimundurkan beberapa minggu.
          </p>
          <div class="pt-2 font-mono text-[11px] text-zinc-500 flex items-center gap-1.5">
            <CheckCircle :size="13" class="text-zinc-900" />
            <span>Simulasi komparatif non-destruktif</span>
          </div>
        </div>

        <!-- Pillar 2 -->
        <div class="rounded-2xl border border-zinc-300 bg-white p-6 shadow-clean-sm space-y-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 text-white">
            <Layers :size="20" />
          </div>
          <h3 class="text-sm font-extrabold text-zinc-950 uppercase">Multi-Factor Risk Engine</h3>
          <p class="text-xs text-zinc-600 leading-relaxed">
            Mengombinasikan 4 variabel kritis: Risiko Cuaca (30%), Risiko Kebutuhan Air (25%), Kesesuaian Agroklimat (25%), dan Risiko Fluktuasi Ekonomi Pasar (20%).
          </p>
          <div class="pt-2 font-mono text-[11px] text-zinc-500 flex items-center gap-1.5">
            <CheckCircle :size="13" class="text-zinc-900" />
            <span>Scoring tertimbang 0–100</span>
          </div>
        </div>

        <!-- Pillar 3 -->
        <div class="rounded-2xl border border-zinc-300 bg-white p-6 shadow-clean-sm space-y-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 text-white">
            <Scale :size="20" />
          </div>
          <h3 class="text-sm font-extrabold text-zinc-950 uppercase">Scenario Comparison & Portfolio</h3>
          <p class="text-xs text-zinc-600 leading-relaxed">
            Bandingkan beberapa pilihan tanaman (cth: Padi vs Jagung vs Kedelai) dan rancang diversifikasi lahan multi-komoditas guna memitigasi risiko gagal panen total.
          </p>
          <div class="pt-2 font-mono text-[11px] text-zinc-500 flex items-center gap-1.5">
            <CheckCircle :size="13" class="text-zinc-900" />
            <span>Explainable recommendation insights</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Comparison Table / Why Siap Tani (PRD Section 29) -->
    <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="rounded-3xl border-2 border-zinc-950 bg-zinc-50 p-8 sm:p-10 shadow-clean-md">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
          <div>
            <h3 class="text-lg sm:text-xl font-extrabold text-zinc-950 uppercase tracking-tight">
              Diferensiasi: Aplikasi Cuaca Biasa vs Siap Tani DSS
            </h3>
            <p class="text-xs text-zinc-600 mt-1">Mengapa pendekatan simulasi keputusan lebih unggul dibanding ramalan cuaca sederhana</p>
          </div>
          <span class="self-start rounded-full bg-zinc-950 px-3 py-1 text-xs font-mono font-bold text-white">
            DSS Matrix
          </span>
        </div>

        <div class="mt-6 overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-zinc-300 font-mono text-zinc-500 uppercase text-[11px]">
                <th class="py-3 pr-4">Fitur / Dimensi</th>
                <th class="py-3 px-4 text-zinc-500">Sistem Cuaca Biasa</th>
                <th class="py-3 pl-4 font-bold text-zinc-950">Siap Tani DSS</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-200 font-mono">
              <tr>
                <td class="py-3 pr-4 font-bold text-zinc-900">Penyajian Cuaca</td>
                <td class="py-3 px-4 text-zinc-500">Menampilkan temperatur & hujan mentah</td>
                <td class="py-3 pl-4 font-bold text-zinc-950">Menganalisis dampak agronomis terhadap tanaman</td>
              </tr>
              <tr>
                <td class="py-3 pr-4 font-bold text-zinc-900">Waktu Tanam</td>
                <td class="py-3 px-4 text-zinc-500">Kalender tanam statis / kalender adat</td>
                <td class="py-3 pl-4 font-bold text-zinc-950">Simulasi dinamis & scanner jendela tanam optimal</td>
              </tr>
              <tr>
                <td class="py-3 pr-4 font-bold text-zinc-900">Pilihan Tanaman</td>
                <td class="py-3 px-4 text-zinc-500">Satu rekomendasi tanpa opsi</td>
                <td class="py-3 pl-4 font-bold text-zinc-950">Komparasi multi-skenario (A vs B vs C)</td>
              </tr>
              <tr>
                <td class="py-3 pr-4 font-bold text-zinc-900">Faktor Ekonomi</td>
                <td class="py-3 px-4 text-zinc-500">Tidak mempertimbangkan harga pasar</td>
                <td class="py-3 pl-4 font-bold text-zinc-950">Evaluasi risiko volatilitas harga & margin hasil</td>
              </tr>
              <tr>
                <td class="py-3 pr-4 font-bold text-zinc-900">Diversifikasi Lahan</td>
                <td class="py-3 px-4 text-zinc-500">Hanya monokultur</td>
                <td class="py-3 pl-4 font-bold text-zinc-950">Simulator portofolio multi-tanaman</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Sprout,
  ArrowRight,
  BookOpen,
  Sliders,
  Calendar,
  Layers,
  Scale,
  CheckCircle,
  Loader2
} from '@lucide/vue'
import LocationSearch from '~/components/simulator/LocationSearch.vue'
import CropSelectModal from '~/components/simulator/CropSelectModal.vue'

const { isAuthenticated, openAuthModal } = useAuth()
const { runSimulation, isLoading } = useSimulation()

const quickLocation = ref({
  name: 'Sidoarjo',
  latitude: -7.4478,
  longitude: 112.7183
})

const quickCropSlug = ref('padi')

// Default date: 15 days from today
const getDefaultDate = () => {
  const d = new Date()
  d.setDate(d.getDate() + 15)
  return d.toISOString().split('T')[0]
}
const quickDate = ref(getDefaultDate())

const startSimulation = () => {
  if (!isAuthenticated.value) {
    openAuthModal('/simulate')
  } else {
    navigateTo('/simulate')
  }
}

const executeQuickSim = async () => {
  if (!isAuthenticated.value) {
    openAuthModal('/simulate')
    return
  }

  await runSimulation({
    location_name: quickLocation.value.name,
    latitude: quickLocation.value.latitude,
    longitude: quickLocation.value.longitude,
    crop_slug: quickCropSlug.value,
    planting_date: quickDate.value,
    land_area: 1000,
    is_baseline: true
  })

  navigateTo('/simulate')
}
</script>
