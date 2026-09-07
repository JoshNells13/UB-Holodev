<template>
  <div class="space-y-16 py-6 sm:py-12">
    <!-- Hero Section -->
    <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="relative overflow-hidden rounded-3xl border border-forest-950/10 bg-white p-6 sm:p-10 lg:p-12 shadow-premium">
        <!-- Subtle Grid Pattern -->
        <div class="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none"></div>

        <div class="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <!-- Left: Hero Headline -->
          <div class="lg:col-span-7 space-y-6 text-left">
            <div class="inline-flex items-center gap-2 rounded-full border border-forest-900/20 bg-forest-50/80 px-3.5 py-1 text-xs font-bold text-forest-950 shadow-xs">
              <Sprout :size="14" class="text-forest-700" />
              <span>Climate-Agricultural Decision Support System (DSS)</span>
            </div>

            <div class="space-y-3">
              <h1 class="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-forest-950 uppercase leading-none">
                SIMULASIKAN <br />
                <span class="relative inline-block">
                  SEBELUM MENANAM.
                  <span class="absolute left-0 -bottom-1 w-20 sm:w-28 h-1.5 bg-gold-500 rounded-full"></span>
                </span>
              </h1>
            </div>

            <p class="max-w-xl text-xs sm:text-sm sm:leading-relaxed text-zinc-600 font-normal">
              Jangan hanya melihat prakiraan cuaca. SIAP TANI mengintegrasikan data agroklimat, kalkulasi kebutuhan air, dan analisis risiko ekonomi menjadi simulasi keputusan pertanian yang dapat diuji secara virtual.
            </p>

            <!-- CTA Buttons -->
            <div class="flex flex-wrap items-center gap-3 pt-2">
              <button
                @click="startSimulation"
                class="flex items-center gap-2 rounded-xl bg-forest-950 px-6 py-3.5 text-xs sm:text-sm font-extrabold text-white transition hover:bg-forest-900 shadow-md ring-1 ring-forest-900 group"
              >
                <span>Mulai Simulasi Keputusan</span>
                <ArrowRight :size="15" class="transition-transform group-hover:translate-x-1 text-gold-400" />
              </button>

              <NuxtLink
                to="/crops"
                class="flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 py-3.5 text-xs sm:text-sm font-bold text-zinc-800 transition hover:bg-forest-50 hover:border-forest-300 shadow-xs"
              >
                <BookOpen :size="15" class="text-forest-800" />
                <span>Katalog Tanaman</span>
              </NuxtLink>
            </div>

            <!-- Value Proposition Pills -->
            <div class="pt-6 border-t border-zinc-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs text-zinc-700">
              <div class="p-2.5 rounded-xl bg-forest-50/50 border border-forest-950/5">
                <span class="block text-[10px] text-forest-700 uppercase font-extrabold">1. SIMULATE</span>
                <span class="font-bold text-zinc-900">Uji Tanggal & Tanaman</span>
              </div>
              <div class="p-2.5 rounded-xl bg-forest-50/50 border border-forest-950/5">
                <span class="block text-[10px] text-forest-700 uppercase font-extrabold">2. COMPARE</span>
                <span class="font-bold text-zinc-900">Komparasi Skenario</span>
              </div>
              <div class="p-2.5 rounded-xl bg-forest-50/50 border border-forest-950/5">
                <span class="block text-[10px] text-forest-700 uppercase font-extrabold">3. DECIDE</span>
                <span class="font-bold text-zinc-900">Keputusan Berbasis Data</span>
              </div>
            </div>
          </div>

          <!-- Right: Interactive Quick Simulation Launcher Card -->
          <div class="lg:col-span-5">
            <div class="rounded-3xl border border-forest-900 bg-forest-950 p-6 sm:p-7 shadow-premium space-y-4 text-white">
              <div class="flex items-center justify-between border-b border-forest-800 pb-3">
                <div class="flex items-center gap-2.5">
                  <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-forest-800 text-gold-400">
                    <Sliders :size="15" />
                  </div>
                  <h3 class="text-xs font-extrabold uppercase tracking-wider text-white font-mono">QUICK SIMULATION LAUNCHER</h3>
                </div>
                <span class="rounded-full bg-forest-900 px-2.5 py-0.5 text-[10px] font-mono font-bold text-gold-400 border border-forest-700">
                  Instant
                </span>
              </div>

              <!-- Quick Location -->
              <div class="space-y-1.5">
                <label class="block text-xs font-bold uppercase tracking-wider text-emerald-200/90 flex items-center justify-between">
                  <span class="flex items-center gap-1.5">
                    <MapPin :size="13" class="text-gold-400" />
                    <span>1. LOKASI LAHAN</span>
                  </span>
                  <span class="text-[10px] font-mono text-emerald-300/60">
                    {{ quickLocation.latitude.toFixed(3) }}°, {{ quickLocation.longitude.toFixed(3) }}°
                  </span>
                </label>
                <div class="relative">
                  <input
                    v-model="quickLocation.name"
                    type="text"
                    class="w-full rounded-xl border border-forest-800 bg-white px-3.5 py-2.5 text-xs font-semibold text-zinc-950 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500 shadow-inner"
                    placeholder="Ketik lokasi lahan..."
                  />
                  <button
                    v-if="quickLocation.name"
                    type="button"
                    @click="quickLocation.name = ''"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                  >
                    <X :size="13" />
                  </button>
                </div>
                <!-- Quick cities -->
                <div class="flex flex-wrap items-center gap-1.5 pt-1">
                  <span class="text-[10px] font-mono text-emerald-300/60 uppercase">CEPAT:</span>
                  <button
                    v-for="city in quickPresetCities"
                    :key="city.name"
                    type="button"
                    @click="selectQuickCity(city)"
                    class="rounded-lg px-2 py-0.5 text-[10px] font-mono font-bold transition"
                    :class="quickLocation.name === city.name ? 'bg-gold-500 text-forest-950' : 'bg-forest-900/90 text-emerald-100 hover:bg-forest-800 border border-forest-800'"
                  >
                    {{ city.name }}
                  </button>
                </div>
              </div>

              <!-- Quick Crop -->
              <div class="space-y-1.5">
                <label class="block text-xs font-bold uppercase tracking-wider text-emerald-200/90 flex items-center justify-between">
                  <span class="flex items-center gap-1.5">
                    <Sprout :size="13" class="text-gold-400" />
                    <span>2. KOMODITAS TANAMAN</span>
                  </span>
                  <span class="text-[10px] font-mono text-emerald-300/60">105–120 HARI</span>
                </label>
                <div
                  @click="openCropModal = true"
                  class="cursor-pointer flex items-center justify-between rounded-xl border border-forest-800 bg-white p-3 text-zinc-900 transition hover:border-gold-400 shadow-sm"
                >
                  <div class="flex items-center gap-2.5">
                    <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-forest-100 text-forest-900 font-bold border border-forest-200">
                      <Sprout :size="16" />
                    </div>
                    <div>
                      <div class="flex items-center gap-1.5">
                        <span class="text-xs font-bold text-zinc-950">{{ selectedCropDisplay.name }}</span>
                        <span class="rounded bg-gold-100 text-gold-900 px-1 py-0.2 text-[8px] font-mono font-bold uppercase">
                          {{ selectedCropDisplay.category }}
                        </span>
                      </div>
                      <p class="text-[10px] text-zinc-500 font-mono">
                        Air: {{ selectedCropDisplay.water }} • Suhu: {{ selectedCropDisplay.temp }}
                      </p>
                    </div>
                  </div>
                  <ChevronRight :size="14" class="text-zinc-400" />
                </div>
              </div>

              <!-- Quick Date -->
              <div class="space-y-1.5">
                <label class="block text-xs font-bold uppercase tracking-wider text-emerald-200/90 flex items-center justify-between">
                  <span class="flex items-center gap-1.5">
                    <Calendar :size="13" class="text-gold-400" />
                    <span>3. TANGGAL RENCANA TANAM</span>
                  </span>
                </label>
                <input
                  v-model="quickDate"
                  type="date"
                  class="w-full rounded-xl border border-forest-800 bg-white px-3.5 py-2.5 text-xs font-semibold text-zinc-950 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500 shadow-inner"
                />
              </div>

              <!-- Submit Button -->
              <button
                @click="executeQuickSim"
                :disabled="isLoading"
                class="w-full flex items-center justify-center gap-2 rounded-xl bg-gold-500 py-3.5 text-xs font-extrabold text-forest-950 transition hover:bg-gold-400 shadow-lg shadow-gold-500/20 disabled:opacity-50"
              >
                <Loader2 v-if="isLoading" :size="15" class="animate-spin" />
                <span v-else>Jalankan Simulasi Agroklimat</span>
              </button>

              <p class="text-center text-[10px] text-emerald-200/50 font-mono">
                * Wajib masuk/daftar akun sebelum melihat hasil analisis
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Core DSS Pillars Section -->
    <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-2xl mx-auto mb-10 space-y-2">
        <h2 class="text-2xl sm:text-3xl font-extrabold text-forest-950 uppercase tracking-tight">
          ARSITEKTUR KEPUTUSAN PERTANIAN
        </h2>
        <p class="text-xs sm:text-sm text-zinc-600">
          SIAP TANI tidak hanya menyajikan data mentah cuaca, melainkan mengonversinya menjadi wawasan agronomi terukur.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Pillar 1 -->
        <div class="rounded-3xl border border-forest-950/10 bg-white p-7 shadow-premium space-y-4 hover:shadow-premium-hover transition">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-950 text-gold-400 shadow-sm">
            <Sliders :size="20" />
          </div>
          <h3 class="text-sm font-extrabold text-forest-950 uppercase tracking-tight">WHAT-IF AGRICULTURAL SIMULATION</h3>
          <p class="text-xs text-zinc-600 leading-relaxed">
            Eksplorasi skenario tanam secara fleksibel. Amati langsung perubahan skor dan penurunan risiko saat tanggal tanam dimajukan atau dimundurkan beberapa minggu.
          </p>
          <div class="pt-3 border-t border-zinc-100 font-mono text-[11px] text-forest-800 flex items-center gap-1.5 font-bold">
            <CheckCircle :size="13" class="text-forest-700" />
            <span>Simulasi komparatif non-destruktif</span>
          </div>
        </div>

        <!-- Pillar 2 -->
        <div class="rounded-3xl border border-forest-950/10 bg-white p-7 shadow-premium space-y-4 hover:shadow-premium-hover transition">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-950 text-gold-400 shadow-sm">
            <Layers :size="20" />
          </div>
          <h3 class="text-sm font-extrabold text-forest-950 uppercase tracking-tight">MULTI-FACTOR RISK ENGINE</h3>
          <p class="text-xs text-zinc-600 leading-relaxed">
            Mengombinasikan 4 variabel kritis: Risiko Cuaca (30%), Risiko Kebutuhan Air (25%), Kesesuaian Agroklimat (25%), dan Risiko Fluktuasi Ekonomi Pasar (20%).
          </p>
          <div class="pt-3 border-t border-zinc-100 font-mono text-[11px] text-forest-800 flex items-center gap-1.5 font-bold">
            <CheckCircle :size="13" class="text-forest-700" />
            <span>Scoring tertimbang 0–100</span>
          </div>
        </div>

        <!-- Pillar 3 -->
        <div class="rounded-3xl border border-forest-950/10 bg-white p-7 shadow-premium space-y-4 hover:shadow-premium-hover transition">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-950 text-gold-400 shadow-sm">
            <Scale :size="20" />
          </div>
          <h3 class="text-sm font-extrabold text-forest-950 uppercase tracking-tight">SCENARIO COMPARISON & PORTFOLIO</h3>
          <p class="text-xs text-zinc-600 leading-relaxed">
            Bandingkan beberapa pilihan tanaman (cth: Padi vs Jagung vs Kedelai) dan rancang diversifikasi lahan multi-komoditas guna memitigasi risiko gagal panen total.
          </p>
          <div class="pt-3 border-t border-zinc-100 font-mono text-[11px] text-forest-800 flex items-center gap-1.5 font-bold">
            <CheckCircle :size="13" class="text-forest-700" />
            <span>Explainable recommendation insights</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Comparison Table / Why Siap Tani -->
    <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="rounded-3xl border border-forest-900 bg-forest-950 p-6 sm:p-10 shadow-premium text-white">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-forest-800 pb-6">
          <div>
            <h3 class="text-lg sm:text-xl font-extrabold text-white uppercase tracking-tight">
              DIFERENSIASI: APLIKASI CUACA BIASA VS SIAPTANI DSS
            </h3>
            <p class="text-xs text-emerald-200/70 mt-1">Mengapa pendekatan simulasi keputusan lebih unggul dibanding ramalan cuaca sederhana</p>
          </div>
          <span class="self-start rounded-full bg-gold-500 px-3.5 py-1 text-xs font-mono font-extrabold text-forest-950 shadow-xs">
            DSS Matrix
          </span>
        </div>

        <div class="mt-6 overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-forest-800 font-mono text-emerald-300/60 uppercase text-[11px]">
                <th class="py-3.5 pr-4">FITUR / DIMENSI</th>
                <th class="py-3.5 px-4 text-emerald-300/60">SISTEM CUACA BIASA</th>
                <th class="py-3.5 pl-4 font-extrabold text-gold-400">TANIAMAN DSS</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-forest-900 font-sans">
              <tr>
                <td class="py-3.5 pr-4 font-bold text-white">Penyajian Cuaca</td>
                <td class="py-3.5 px-4 text-emerald-200/70">Menampilkan temperatur & hujan mentah</td>
                <td class="py-3.5 pl-4 font-bold text-gold-300">Menganalisis dampak agronomis terhadap tanaman</td>
              </tr>
              <tr>
                <td class="py-3.5 pr-4 font-bold text-white">Waktu Tanam</td>
                <td class="py-3.5 px-4 text-emerald-200/70">Kalender tanam statis / kalender adat</td>
                <td class="py-3.5 pl-4 font-bold text-gold-300">Simulasi dinamis & scanner jendela tanam optimal</td>
              </tr>
              <tr>
                <td class="py-3.5 pr-4 font-bold text-white">Pilihan Tanaman</td>
                <td class="py-3.5 px-4 text-emerald-200/70">Satu rekomendasi tanpa opsi</td>
                <td class="py-3.5 pl-4 font-bold text-gold-300">Komparasi multi-skenario (A vs B vs C)</td>
              </tr>
              <tr>
                <td class="py-3.5 pr-4 font-bold text-white">Faktor Ekonomi</td>
                <td class="py-3.5 px-4 text-emerald-200/70">Tidak mempertimbangkan harga pasar</td>
                <td class="py-3.5 pl-4 font-bold text-gold-300">Evaluasi risiko volatilitas harga & margin hasil</td>
              </tr>
              <tr>
                <td class="py-3.5 pr-4 font-bold text-white">Diversifikasi Lahan</td>
                <td class="py-3.5 px-4 text-emerald-200/70">Hanya monokultur</td>
                <td class="py-3.5 pl-4 font-bold text-gold-300">Simulator portofolio multi-tanaman</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- Crop Select Quick Modal -->
    <div
      v-if="openCropModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-forest-950/70 p-4 backdrop-blur-sm"
      @click.self="openCropModal = false"
    >
      <div class="w-full max-w-xl max-h-[85vh] flex flex-col rounded-3xl border border-forest-900 bg-white shadow-2xl overflow-hidden">
        <div class="flex items-center justify-between p-4 border-b border-zinc-200">
          <h3 class="text-sm font-bold text-forest-950">Pilih Komoditas Tanaman</h3>
          <button @click="openCropModal = false" class="text-zinc-400 hover:text-zinc-700">
            <X :size="18" />
          </button>
        </div>
        <div class="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto">
          <div
            v-for="c in quickCropOptions"
            :key="c.slug"
            @click="pickCrop(c)"
            class="cursor-pointer rounded-2xl border p-3.5 transition flex flex-col justify-between"
            :class="quickCropSlug === c.slug ? 'border-forest-950 bg-forest-950 text-white' : 'border-zinc-200 bg-zinc-50 hover:bg-forest-50/50'"
          >
            <div>
              <span
                class="rounded px-1.5 py-0.2 text-[8px] font-mono font-bold uppercase"
                :class="quickCropSlug === c.slug ? 'bg-gold-500 text-forest-950' : 'bg-zinc-200 text-zinc-700'"
              >
                {{ c.category }}
              </span>
              <h4 class="font-bold text-xs mt-1.5">{{ c.name }}</h4>
              <p class="text-[10px] mt-1 opacity-80">{{ c.water }} • {{ c.temp }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
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
  Loader2,
  MapPin,
  X,
  ChevronRight
} from '@lucide/vue'

const { isAuthenticated, openAuthModal } = useAuth()
const { runSimulation, isLoading } = useSimulation()

const quickLocation = ref({
  name: 'Sidoarjo',
  latitude: -7.4478,
  longitude: 112.7183
})

const quickPresetCities = [
  { name: 'Sidoarjo', latitude: -7.4478, longitude: 112.7183 },
  { name: 'Malang', latitude: -7.9797, longitude: 112.6304 },
  { name: 'Karawang', latitude: -6.3073, longitude: 107.3069 },
  { name: 'Subang', latitude: -6.5686, longitude: 107.7634 },
  { name: 'Sragen', latitude: -7.4269, longitude: 111.0222 }
]

const selectQuickCity = (city: { name: string; latitude: number; longitude: number }) => {
  quickLocation.value = { ...city }
}

const quickCropSlug = ref('padi')
const openCropModal = ref(false)

const quickCropOptions = [
  { slug: 'padi', name: 'Padi Sawah (Oryza sativa)', category: 'PANGAN UTAMA', water: 'High (550mm)', temp: '22-34°C' },
  { slug: 'jagung', name: 'Jagung Hibrida (Zea mays)', category: 'PALAWIJA', water: 'Medium (380mm)', temp: '21-32°C' },
  { slug: 'kedelai', name: 'Kedelai (Glycine max)', category: 'KACANG-KACANGAN', water: 'Medium (320mm)', temp: '20-30°C' },
  { slug: 'bawang-merah', name: 'Bawang Merah (Allium ascalonicum)', category: 'HORTIKULTURA', water: 'Medium (280mm)', temp: '25-32°C' },
  { slug: 'cabai-merah', name: 'Cabai Merah Keriting (Capsicum annuum)', category: 'HORTIKULTURA', water: 'Medium (400mm)', temp: '24-30°C' },
  { slug: 'tomat', name: 'Tomat (Solanum lycopersicum)', category: 'HORTIKULTURA', water: 'Medium (350mm)', temp: '20-27°C' }
]

const selectedCropDisplay = ref(quickCropOptions[0])

const pickCrop = (c: any) => {
  quickCropSlug.value = c.slug
  selectedCropDisplay.value = c
  openCropModal.value = false
}

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
