<template>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    <!-- Top Header Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
      <div>
        <div class="flex items-center gap-2">
          <span class="rounded bg-zinc-950 px-2 py-0.5 font-mono text-[10px] font-bold text-white uppercase">
            Simulation Studio
          </span>
          <span class="text-xs font-mono text-zinc-500">Decision Support Workspace</span>
        </div>
        <h1 class="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 uppercase">
          Simulasi Keputusan Pertanian
        </h1>
        <p class="text-xs text-zinc-500 mt-0.5">Kalkulasi presisi berbasis agroklimat BMKG, pedoman budidaya Kementan RI, dan neraca air FAO-56</p>
      </div>

      <!-- Action buttons -->
      <div class="flex flex-wrap items-center gap-2.5">
        <button
          v-if="currentScenario"
          type="button"
          @click="handleSave"
          :disabled="isSaving"
          class="flex items-center gap-1.5 rounded-xl border-2 border-zinc-900 bg-white px-3.5 py-2 text-xs font-bold text-zinc-900 transition hover:bg-zinc-100 shadow-sm"
        >
          <BookmarkCheck v-if="saveSuccess" :size="15" class="text-zinc-950" />
          <Loader2 v-else-if="isSaving" :size="15" class="animate-spin text-zinc-950" />
          <Save v-else :size="15" />
          <span>{{ saveSuccess ? 'Tersimpan ke Supabase!' : (isSaving ? 'Menyimpan...' : 'Simpan Simulasi') }}</span>
        </button>

        <button
          v-if="currentScenario"
          type="button"
          @click="handleScheduleCalendar"
          class="flex items-center gap-1.5 rounded-xl border-2 border-zinc-900 bg-zinc-100 px-3.5 py-2 text-xs font-bold text-zinc-950 transition hover:bg-zinc-200 shadow-sm"
        >
          <Calendar :size="15" />
          <span>Tandai di Kalender Tanam</span>
        </button>

        <button
          v-if="currentScenario"
          type="button"
          @click="handleAddToComparison"
          class="flex items-center gap-1.5 rounded-xl border-2 border-zinc-900 bg-zinc-100 px-3.5 py-2 text-xs font-bold text-zinc-950 transition hover:bg-zinc-200 shadow-sm"
        >
          <Plus :size="15" />
          <span>+ Komparasi ({{ comparisonList.length }})</span>
        </button>

        <NuxtLink
          to="/compare"
          v-if="comparisonList.length > 0"
          class="flex items-center gap-1.5 rounded-xl bg-zinc-950 px-4 py-2 text-xs font-bold text-white transition hover:bg-zinc-800 shadow-sm"
        >
          <Scale :size="15" />
          <span>Buka Komparasi</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Notification Toast if saved -->
    <div
      v-if="saveToastMsg"
      class="rounded-xl border border-zinc-950 bg-zinc-950 p-3 text-xs font-mono font-bold text-white flex items-center justify-between shadow-lg"
    >
      <div class="flex items-center gap-2">
        <BookmarkCheck :size="16" />
        <span>{{ saveToastMsg }}</span>
      </div>
      <button @click="saveToastMsg = ''" class="text-zinc-400 hover:text-white">
        <X :size="14" />
      </button>
    </div>

    <!-- Main Workspace Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Left Column: Input Form / Controls (Sticky on Desktop) -->
      <div class="lg:col-span-4 space-y-6">
        <div class="rounded-2xl border-2 border-zinc-950 bg-zinc-50 p-6 shadow-clean-md space-y-5">
          <div class="flex items-center justify-between border-b border-zinc-200 pb-3">
            <h3 class="text-xs font-extrabold uppercase tracking-wider text-zinc-950 flex items-center gap-1.5">
              <Sliders :size="15" />
              <span>Parameter Lahan</span>
            </h3>
            <span class="text-[10px] font-mono text-zinc-500 uppercase">Input Data</span>
          </div>

          <!-- 1. Location Search -->
          <LocationSearch v-model="formLocation" @change="onParamChange" />

          <!-- Interactive Farm Map & GPS -->
          <FarmMapPicker
            :latitude="formLocation.latitude"
            :longitude="formLocation.longitude"
            :name="formLocation.name"
            @update:location="onMapLocationUpdate"
          />

          <!-- 2. Crop -->
          <CropSelectModal v-model="formCropSlug" @change="onParamChange" />

          <!-- 3. Land Area -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5 flex items-center justify-between">
              <span class="flex items-center gap-1.5">
                <Maximize2 :size="14" class="text-zinc-900" />
                <span>3. Luas Lahan (m²)</span>
              </span>
              <span class="text-[10px] font-mono text-zinc-500">
                {{ (formLandArea / 10000).toFixed(2) }} Hektar
              </span>
            </label>
            <input
              v-model.number="formLandArea"
              type="number"
              min="100"
              step="100"
              @change="onParamChange"
              class="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-mono font-bold text-zinc-900 focus:border-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-950 shadow-sm"
            />
          </div>

          <!-- 4. Planting Date -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5 flex items-center justify-between">
              <span class="flex items-center gap-1.5">
                <Calendar :size="14" class="text-zinc-900" />
                <span>4. Tanggal Rencana Tanam</span>
              </span>
            </label>
            <input
              v-model="formPlantingDate"
              type="date"
              @change="onParamChange"
              class="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 focus:border-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-950 shadow-sm"
            />
          </div>

          <!-- 5. Irrigation Toggle -->
          <div class="rounded-xl border border-zinc-200 bg-white p-3 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Droplet :size="15" class="text-zinc-900" />
              <div>
                <span class="block text-xs font-bold text-zinc-950">Akses Irigasi Teknis</span>
                <span class="block text-[10px] text-zinc-500">{{ formIrrigation ? 'Tersedia Saluran Irigasi' : 'Lahan Tadah Hujan' }}</span>
              </div>
            </div>
            <button
              type="button"
              @click="toggleIrrigation"
              class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              :class="formIrrigation ? 'bg-zinc-950' : 'bg-zinc-300'"
            >
              <span
                class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                :class="formIrrigation ? 'translate-x-4' : 'translate-x-0'"
              />
            </button>
          </div>

          <!-- Recalculate Button -->
          <button
            type="button"
            @click="triggerRecalculate"
            :disabled="isLoading"
            class="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-950 py-3 text-xs font-extrabold text-white transition hover:bg-zinc-800 shadow-md disabled:opacity-50"
          >
            <Loader2 v-if="isLoading" :size="15" class="animate-spin" />
            <span v-else>Kalkulasi Ulang Skenario</span>
          </button>
        </div>

        <!-- Official References Card -->
        <div class="rounded-2xl border border-zinc-200 bg-white p-4 space-y-2 text-xs">
          <div class="flex items-center gap-2 font-bold text-zinc-950 text-[11px] uppercase font-mono">
            <ShieldCheck :size="14" />
            <span>Basis Data & Sumber Resmi</span>
          </div>
          <div class="space-y-1 text-[11px] text-zinc-600 font-mono">
            <p>• <strong>BMKG:</strong> Agroklimatologi, Zona Musim (ZOM) & Suhu</p>
            <p>• <strong>Kementan RI:</strong> Kalender Tanam Terpadu (KATAM) & Budidaya</p>
            <p>• <strong>FAO-56:</strong> Neraca Air & Evapotranspirasi (ETc = Kc × ET0)</p>
            <p>• <strong>Open-Meteo & NASA:</strong> Reanalisis Presisi Satelit ECMWF</p>
          </div>
        </div>
      </div>

      <!-- Right Column: Results & Clean Structured Dashboard -->
      <div class="lg:col-span-8 space-y-6">
        <template v-if="currentScenario">
          <!-- 1. HERO EXECUTIVE SUMMARY CARD -->
          <div class="rounded-3xl border-2 border-zinc-950 bg-white p-6 sm:p-7 shadow-clean-lg space-y-6">
            <!-- Header with Status & Score -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
              <div class="space-y-1.5">
                <div class="flex flex-wrap items-center gap-2">
                  <span
                    class="rounded-full px-3 py-1 text-xs font-extrabold font-mono uppercase"
                    :class="getRecommendationBadgeClass(currentScenario.risk_breakdown.recommendation)"
                  >
                    {{ currentScenario.risk_breakdown.recommendation }}
                  </span>
                  <span class="text-xs font-mono text-zinc-500">
                    {{ currentScenario.location_name }} • {{ currentScenario.crop.name }}
                  </span>
                </div>
                <h2 class="text-xl sm:text-2xl font-extrabold text-zinc-950">
                  Keputusan Tanam {{ currentScenario.crop.name }} ({{ formatFullDate(currentScenario.planting_date) }})
                </h2>
              </div>

              <!-- Big Score Block -->
              <div class="flex items-center gap-3 bg-zinc-50 px-4 py-2.5 rounded-2xl border border-zinc-200 shrink-0">
                <div class="text-right">
                  <span class="block text-[9px] font-mono uppercase text-zinc-400 font-bold">Skor Kelayakan DSS</span>
                  <div class="flex items-baseline justify-end gap-1">
                    <span class="font-mono text-3xl sm:text-4xl font-extrabold text-zinc-950">
                      {{ currentScenario.risk_breakdown.total_score }}
                    </span>
                    <span class="font-mono text-xs text-zinc-400 font-bold">/100</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 4 Quick Key Metrics Pills -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div class="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                <span class="block text-[10px] font-mono text-zinc-500 uppercase">Estimasi Panen</span>
                <span class="mt-0.5 block font-mono text-base font-extrabold text-zinc-950">
                  {{ currentScenario.detailed_agronomy?.financial_projection.estimated_yield_ton_per_ha || '6.2' }} Ton/Ha
                </span>
                <span class="text-[10px] font-mono text-zinc-400">
                  Total {{ currentScenario.detailed_agronomy?.financial_projection.total_production_kg.toLocaleString('id-ID') || '620' }} kg
                </span>
              </div>

              <div class="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                <span class="block text-[10px] font-mono text-zinc-500 uppercase">Proyeksi Laba Bersih</span>
                <span class="mt-0.5 block font-mono text-base font-extrabold text-zinc-950">
                  Rp {{ ((currentScenario.detailed_agronomy?.financial_projection.net_profit_idr || 0) / 1000000).toFixed(2) }} Jt
                </span>
                <span class="text-[10px] font-mono text-zinc-400">
                  ROI: {{ currentScenario.detailed_agronomy?.financial_projection.roi_percentage || 0 }}%
                </span>
              </div>

              <div class="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                <span class="block text-[10px] font-mono text-zinc-500 uppercase">Kebutuhan Air Tanaman</span>
                <span class="mt-0.5 block font-mono text-base font-extrabold text-zinc-950">
                  {{ currentScenario.crop.water_requirement_mm }} mm
                </span>
                <span class="text-[10px] font-mono text-zinc-400">
                  {{ currentScenario.detailed_agronomy?.soil_water_balance.water_balance_status || 'Optimal' }}
                </span>
              </div>

              <div class="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                <span class="block text-[10px] font-mono text-zinc-500 uppercase">Siklus Tanam</span>
                <span class="mt-0.5 block font-mono text-base font-extrabold text-zinc-950">
                  {{ Math.round((currentScenario.crop.growth_days_min + currentScenario.crop.growth_days_max) / 2) }} Hari
                </span>
                <span class="text-[10px] font-mono text-zinc-400">
                  Est. Panen: {{ calculateHarvestDate(currentScenario.planting_date, currentScenario.crop.growth_days_max) }}
                </span>
              </div>
            </div>

            <!-- Summary Text -->
            <div class="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-3.5 text-xs text-zinc-700 leading-relaxed font-sans flex items-start gap-2.5">
              <Sparkles :size="16" class="text-zinc-950 shrink-0 mt-0.5" />
              <div>
                <span class="font-bold text-zinc-950">Ringkasan Keputusan: </span>
                <span>{{ currentScenario.risk_breakdown.summary_reason }}</span>
              </div>
            </div>

            <!-- Direct Calendar CTA -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-zinc-200">
              <div class="flex items-center gap-2 text-xs text-zinc-600">
                <CalendarCheck :size="16" class="text-zinc-950" />
                <span>Jadwalkan seluruh tahapan (olah lahan, pemupukan I–II, irigasi, panen) ke kalender tani:</span>
              </div>
              <button
                type="button"
                @click="handleScheduleCalendar"
                class="rounded-xl bg-zinc-950 px-4 py-2 text-xs font-bold text-white transition hover:bg-zinc-800 shrink-0 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Calendar :size="14" />
                <span>Tandai di Kalender Tanam</span>
                <ArrowRight :size="13" />
              </button>
            </div>
          </div>

          <!-- 2. 3D DIGITAL TWIN AGRICULTURAL FIELD (HERO VISUALIZER) -->
          <div class="space-y-2">
            <div class="flex items-center justify-between px-1">
              <div class="flex items-center gap-2">
                <span class="rounded bg-zinc-950 px-2 py-0.5 font-mono text-[10px] font-bold text-white uppercase">
                  3D Digital Twin
                </span>
                <span class="text-xs font-bold text-zinc-900 font-mono">Simulasi Visual Lahan Miniatur</span>
              </div>
              <span class="text-[10px] font-mono text-zinc-500">Drag/Orbit untuk memutar • Scroll untuk zoom • Hover tanaman</span>
            </div>

            <DigitalTwinField :scenario="currentScenario" />
          </div>

          <!-- 3. STRUCTURED TABBED VIEWS (Clean & Easy to Read) -->
          <div class="space-y-4">
            <!-- Tab Navigation Bar -->
            <div class="flex rounded-2xl bg-zinc-200/80 p-1.5 font-mono text-xs overflow-x-auto">
              <button
                v-for="t in viewTabs"
                :key="t.id"
                type="button"
                @click="activeViewTab = t.id"
                class="flex items-center gap-1.5 rounded-xl px-4 py-2.5 font-bold transition whitespace-nowrap"
                :class="activeViewTab === t.id ? 'bg-zinc-950 text-white shadow-md' : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100'"
              >
                <component :is="t.icon" :size="15" />
                <span>{{ t.label }}</span>
              </button>
            </div>

            <!-- TAB 1: RINGKASAN & SKOR RISIKO DSS -->
            <div v-if="activeViewTab === 'risk'" class="space-y-6">
              <RiskScoreGauge
                :score="currentScenario.risk_breakdown.total_score"
                :recommendation="currentScenario.risk_breakdown.recommendation"
                :weatherScore="currentScenario.risk_breakdown.weather_risk.score"
                :waterScore="currentScenario.risk_breakdown.water_risk.score"
                :cropScore="currentScenario.risk_breakdown.crop_suitability_risk.score"
                :economicScore="currentScenario.risk_breakdown.economic_risk.score"
                :summaryReason="currentScenario.risk_breakdown.summary_reason"
                :overallRiskLevel="currentScenario.risk_breakdown.weather_risk.risk_level"
              />

              <RiskBreakdownCard :breakdown="currentScenario.risk_breakdown" />
            </div>

            <!-- TAB 2: RENCANA AGRONOMI & FINANSIAL -->
            <div v-else-if="activeViewTab === 'agronomy'" class="space-y-6">
              <DetailedAgronomyCard
                v-if="currentScenario.detailed_agronomy"
                :plan="currentScenario.detailed_agronomy"
              />
            </div>

            <!-- TAB 3: PREDIKSI IKLIM & JENDELA TANAM -->
            <div v-else-if="activeViewTab === 'climate'" class="space-y-6">
              <PlantingWindowCalendar
                v-if="currentScenario.planting_window"
                :windowData="currentScenario.planting_window"
              />

              <WeatherForecastChart
                v-if="currentScenario.climate_summary"
                :climate="currentScenario.climate_summary"
              />
            </div>

            <!-- TAB 4: SANDBOX WHAT-IF -->
            <div v-else-if="activeViewTab === 'whatif'" class="space-y-6">
              <div class="rounded-2xl border border-zinc-300 bg-white p-6 shadow-clean-md space-y-4">
                <div class="border-b border-zinc-200 pb-3">
                  <h3 class="text-xs font-bold uppercase tracking-wider text-zinc-950 flex items-center gap-1.5">
                    <SlidersHorizontal :size="15" />
                    <span>Uji Sensitivitas Tanggal Tanam (What-If Sandbox)</span>
                  </h3>
                  <p class="text-[11px] text-zinc-500">Geser slider untuk melihat perubahan risiko dan rekomendasi secara instan tanpa perlu mengisi ulang form</p>
                </div>

                <WhatIfSlider
                  :currentDate="currentScenario.planting_date"
                  :currentScore="currentScenario.risk_breakdown.total_score"
                  :baselineScore="baselineScenario?.risk_breakdown.total_score || currentScenario.risk_breakdown.total_score"
                  @changeDate="handleWhatIfDateChange"
                />
              </div>
            </div>
          </div>
        </template>

        <!-- Loading Skeleton -->
        <div v-else-if="isLoading" class="rounded-3xl border border-zinc-300 bg-white p-12 text-center shadow-clean-md">
          <Loader2 :size="36" class="mx-auto animate-spin text-zinc-950" />
          <p class="mt-4 font-mono text-xs font-bold text-zinc-950 uppercase">Menghubungkan ke Open-Meteo & Menjalankan Risk Engine BMKG/FAO...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  Sliders,
  Maximize2,
  Calendar,
  Droplet,
  Save,
  BookmarkCheck,
  Plus,
  Scale,
  Loader2,
  X,
  Sparkles,
  ShieldCheck,
  CalendarCheck,
  ArrowRight,
  BarChart3,
  BookOpen,
  CloudSun,
  SlidersHorizontal
} from '@lucide/vue'
import LocationSearch from '~/components/simulator/LocationSearch.vue'
import FarmMapPicker from '~/components/simulator/FarmMapPicker.vue'
import CropSelectModal from '~/components/simulator/CropSelectModal.vue'
import WhatIfSlider from '~/components/simulator/WhatIfSlider.vue'
import RiskScoreGauge from '~/components/simulator/RiskScoreGauge.vue'
import RiskBreakdownCard from '~/components/simulator/RiskBreakdownCard.vue'
import DetailedAgronomyCard from '~/components/simulator/DetailedAgronomyCard.vue'
import PlantingWindowCalendar from '~/components/simulator/PlantingWindowCalendar.vue'
import WeatherForecastChart from '~/components/simulator/WeatherForecastChart.vue'
import DigitalTwinField from '~/components/digital-twin/DigitalTwinField.vue'

definePageMeta({
  middleware: 'auth'
})

const {
  currentScenario,
  baselineScenario,
  comparisonList,
  runSimulation,
  runWhatIf,
  addToComparison,
  saveSimulation,
  isLoading,
  pendingLoadParams
} = useSimulation()

const activeViewTab = ref<'risk' | 'agronomy' | 'climate' | 'whatif'>('risk')

const viewTabs = [
  { id: 'risk', label: '1. Skor & Analisis Risiko', icon: BarChart3 },
  { id: 'agronomy', label: '2. Rencana Agronomi & Finansial', icon: BookOpen },
  { id: 'climate', label: '3. Cuaca 16 Hari & Jendela Tanam', icon: CloudSun },
  { id: 'whatif', label: '4. Sandbox What-If', icon: SlidersHorizontal }
]

const formLocation = ref({
  name: 'Sidoarjo',
  latitude: -7.4478,
  longitude: 112.7183
})

const onMapLocationUpdate = (loc: { name: string; latitude: number; longitude: number }) => {
  formLocation.value = loc
  triggerRecalculate()
}

const formCropSlug = ref('padi')
const formLandArea = ref(1000)

const getDefaultDate = () => {
  const d = new Date()
  d.setDate(d.getDate() + 15)
  return d.toISOString().split('T')[0]
}
const formPlantingDate = ref(getDefaultDate())
const formIrrigation = ref(true)
const isSaving = ref(false)
const saveSuccess = ref(false)
const saveToastMsg = ref('')

const toggleIrrigation = () => {
  formIrrigation.value = !formIrrigation.value
  onParamChange()
}

const onParamChange = () => {
  triggerRecalculate()
}

const triggerRecalculate = async () => {
  await runSimulation({
    location_name: formLocation.value.name,
    latitude: formLocation.value.latitude,
    longitude: formLocation.value.longitude,
    land_area: formLandArea.value,
    crop_slug: formCropSlug.value,
    planting_date: formPlantingDate.value,
    irrigation_access: formIrrigation.value,
    is_baseline: !baselineScenario.value
  })
}

const handleWhatIfDateChange = async (newDate: string) => {
  formPlantingDate.value = newDate
  await runWhatIf({
    planting_date: newDate,
    irrigation_access: formIrrigation.value,
    land_area: formLandArea.value
  })
}

const handleAddToComparison = () => {
  addToComparison()
}

const handleScheduleCalendar = () => {
  if (currentScenario.value) {
    // Automatically save or ensure active scenario is ready and navigate to calendar
    navigateTo('/calendar')
  }
}

const handleSave = async () => {
  isSaving.value = true
  saveToastMsg.value = ''
  const res = await saveSimulation()
  isSaving.value = false
  if (res.success) {
    saveSuccess.value = true
    saveToastMsg.value = res.message || 'Simulasi berhasil disimpan ke Supabase PostgreSQL!'
    setTimeout(() => {
      saveSuccess.value = false
    }, 3000)
    setTimeout(() => {
      saveToastMsg.value = ''
    }, 6000)
  }
}

const getRecommendationBadgeClass = (rec: string) => {
  if (rec === 'Highly Recommended') return 'bg-zinc-950 text-white'
  if (rec === 'Recommended') return 'bg-zinc-800 text-white'
  if (rec === 'Consider Carefully') return 'bg-zinc-300 text-zinc-950'
  return 'bg-zinc-400 text-zinc-950'
}

const formatFullDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

const calculateHarvestDate = (plantDateStr: string, growthDays: number) => {
  if (!plantDateStr) return '-'
  const d = new Date(plantDateStr)
  d.setDate(d.getDate() + (growthDays || 115))
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

onMounted(async () => {
  // Check if navigated from history page (history writes pendingLoadParams)
  if (pendingLoadParams.value) {
    const p = pendingLoadParams.value
    formLocation.value = {
      name: p.location_name,
      latitude: p.latitude,
      longitude: p.longitude
    }
    formCropSlug.value = p.crop_slug
    formLandArea.value = p.land_area
    formPlantingDate.value = p.planting_date
    formIrrigation.value = p.irrigation_access

    // Clear so subsequent mounts don't re-apply
    pendingLoadParams.value = null

    // Re-run simulation with the restored params to get fresh risk data
    await triggerRecalculate()
  } else if (!currentScenario.value) {
    await triggerRecalculate()
  } else {
    // Populate form with existing state
    formLocation.value = {
      name: currentScenario.value.location_name,
      latitude: currentScenario.value.latitude,
      longitude: currentScenario.value.longitude
    }
    formCropSlug.value = currentScenario.value.crop.slug
    formPlantingDate.value = currentScenario.value.planting_date
    formLandArea.value = currentScenario.value.land_area
  }
})
</script>
