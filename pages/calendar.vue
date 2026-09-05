<template>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
      <div>
        <div class="flex items-center gap-2">
          <span class="rounded bg-zinc-950 px-2 py-0.5 font-mono text-[10px] font-bold text-white uppercase">
            Agronomy Schedule & Tracker
          </span>
          <span class="text-xs font-mono text-zinc-500">Kalender Aktivitas & Penandaan Tanam</span>
        </div>
        <h1 class="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 uppercase">
          Kalender Tanam & Jadwal Lahan
        </h1>
        <p class="text-xs text-zinc-500 mt-0.5">Pantau tahapan budidaya tanaman hasil simulasi, tandai kegiatan lapangan, dan ekspor ke Google Calendar</p>
      </div>

      <!-- Action buttons -->
      <div class="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          @click="showAddCustomModal = true"
          class="flex items-center gap-1.5 rounded-xl bg-zinc-950 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-zinc-800 shadow-sm"
        >
          <Plus :size="15" />
          <span>Tandai Aktivitas / Catatan Baru</span>
        </button>

        <button
          type="button"
          @click="exportICalendar"
          class="flex items-center gap-1.5 rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs font-bold text-zinc-800 transition hover:bg-zinc-100 shadow-sm"
        >
          <Download :size="15" />
          <span>Ekspor ke Google Calendar (.ics)</span>
        </button>

        <NuxtLink
          to="/simulate"
          class="flex items-center gap-1.5 rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-xs font-bold text-zinc-900 transition hover:bg-zinc-200 shadow-sm"
        >
          <Sliders :size="15" />
          <span>Ubah di Studio Simulasi</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Active Crop Scenario Summary Banner & Switcher -->
    <div v-if="activeScenario" class="rounded-3xl border-2 border-zinc-950 bg-white p-5 shadow-clean-md flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div class="flex items-start sm:items-center gap-3.5">
        <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-white font-bold shrink-0">
          <Sprout :size="24" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-mono font-bold uppercase text-zinc-800 border border-zinc-200">
              Siklus Aktif Terpilih
            </span>
            <span class="text-xs font-mono text-zinc-500">{{ activeScenario.location_name }}</span>
          </div>
          <h3 class="text-base sm:text-lg font-extrabold text-zinc-950 mt-0.5">
            {{ activeScenario.crop.name }} — Tanggal Tanam: {{ formatFullDate(activeScenario.planting_date) }}
          </h3>
          <p class="text-xs text-zinc-600 font-mono">
            Luas Lahan: {{ activeScenario.land_area.toLocaleString('id-ID') }} m² • Skor DSS: <strong>{{ activeScenario.risk_breakdown.total_score }}/100 ({{ activeScenario.risk_breakdown.recommendation }})</strong>
          </p>
        </div>
      </div>

      <!-- Quick stats & progress -->
      <div class="flex flex-wrap items-center gap-3 lg:border-l lg:border-zinc-200 lg:pl-6">
        <div class="rounded-xl bg-zinc-50 border border-zinc-200 p-2.5 text-center min-w-[110px]">
          <span class="block text-[9px] font-mono uppercase text-zinc-400 font-bold">Progress Selesai</span>
          <span class="font-mono text-sm font-extrabold text-zinc-950">{{ completedCount }} / {{ eventsList.length }}</span>
          <span class="block text-[9px] font-mono text-zinc-500">Kegiatan Selesai</span>
        </div>

        <!-- Scenario Selector dropdown if saved items exist -->
        <div v-if="savedSimulations.length > 0" class="flex flex-col">
          <label class="text-[10px] font-mono uppercase font-bold text-zinc-500 mb-1">Ganti Skenario:</label>
          <select
            @change="switchScenario($event)"
            class="rounded-xl border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-bold text-zinc-900 focus:border-zinc-950 focus:outline-none"
          >
            <option :value="activeScenario.id" selected>{{ activeScenario.crop.name }} ({{ activeScenario.planting_date }})</option>
            <option
              v-for="s in savedSimulations.filter(x => x.id !== activeScenario?.id)"
              :key="s.id"
              :value="s.id"
            >
              {{ s.crop.name }} - {{ s.location_name }} ({{ s.planting_date }})
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Calendar Controls Bar (Month Navigation, Filter & View Switcher) -->
    <div class="rounded-2xl border border-zinc-300 bg-white p-4 shadow-clean-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <!-- Nav month -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="goToToday"
          class="rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-xs font-bold text-zinc-800 hover:bg-zinc-100 transition"
        >
          Hari Ini
        </button>
        <div class="flex items-center gap-1">
          <button
            type="button"
            @click="prevMonth"
            class="rounded-lg border border-zinc-200 p-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 transition"
          >
            <ChevronLeft :size="16" />
          </button>
          <button
            type="button"
            @click="nextMonth"
            class="rounded-lg border border-zinc-200 p-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 transition"
          >
            <ChevronRight :size="16" />
          </button>
        </div>
        <h2 class="text-base font-extrabold text-zinc-950 font-mono ml-2">
          {{ monthNames[currentMonth] }} {{ currentYear }}
        </h2>
      </div>

      <!-- Filter Categories -->
      <div class="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
        <button
          v-for="cat in categoryFilters"
          :key="cat"
          type="button"
          @click="selectedCategoryFilter = cat"
          class="rounded-lg px-2.5 py-1 font-semibold transition whitespace-nowrap"
          :class="selectedCategoryFilter === cat ? 'bg-zinc-950 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-950'"
        >
          {{ cat }}
        </button>
      </div>

      <!-- View Switcher -->
      <div class="flex rounded-lg bg-zinc-100 p-1 font-mono text-xs shrink-0">
        <button
          type="button"
          @click="viewMode = 'month'"
          class="rounded-md px-3 py-1 font-bold transition"
          :class="viewMode === 'month' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-600 hover:text-zinc-950'"
        >
          Bulan (Month)
        </button>
        <button
          type="button"
          @click="viewMode = 'agenda'"
          class="rounded-md px-3 py-1 font-bold transition"
          :class="viewMode === 'agenda' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-600 hover:text-zinc-950'"
        >
          Daftar Agenda (Timeline)
        </button>
      </div>
    </div>

    <!-- MONTH VIEW GRID -->
    <div v-if="viewMode === 'month'" class="rounded-2xl border border-zinc-300 bg-white overflow-hidden shadow-clean-md">
      <!-- Days of Week Header -->
      <div class="grid grid-cols-7 border-b border-zinc-200 bg-zinc-50 font-mono text-[11px] font-bold uppercase text-zinc-500 text-center py-2.5">
        <div>Min (Sun)</div>
        <div>Sen (Mon)</div>
        <div>Sel (Tue)</div>
        <div>Rab (Wed)</div>
        <div>Kam (Thu)</div>
        <div>Jum (Fri)</div>
        <div>Sab (Sat)</div>
      </div>

      <!-- Calendar Days Matrix -->
      <div class="grid grid-cols-7 divide-x divide-y divide-zinc-200">
        <div
          v-for="cell in monthCells"
          :key="cell.dateStr"
          class="min-h-[110px] sm:min-h-[125px] p-1.5 sm:p-2 transition flex flex-col justify-between"
          :class="cell.isCurrentMonth ? 'bg-white' : 'bg-zinc-50/50 text-zinc-400'"
        >
          <!-- Date number -->
          <div class="flex items-center justify-between">
            <span
              class="flex h-6 w-6 items-center justify-center rounded-full font-mono text-xs font-bold"
              :class="cell.isToday ? 'bg-zinc-950 text-white' : 'text-zinc-900'"
            >
              {{ cell.dayNum }}
            </span>
            <button
              v-if="cell.isCurrentMonth"
              @click.stop="quickAddForDate(cell.dateStr)"
              class="text-zinc-300 hover:text-zinc-900 p-0.5"
              title="Tandai kegiatan di tanggal ini"
            >
              <Plus :size="12" />
            </button>
          </div>

          <!-- Events in day -->
          <div class="mt-1 space-y-1 flex-1 overflow-y-auto max-h-24">
            <div
              v-for="ev in getFilteredEventsForDate(cell.dateStr)"
              :key="ev.id"
              @click="openEventDetail(ev)"
              class="cursor-pointer rounded border p-1 text-[10px] font-mono leading-tight transition flex items-center justify-between gap-1"
              :class="[getEventStyle(ev.category), isCompleted(ev.id) ? 'opacity-50 line-through' : '']"
              :title="ev.title"
            >
              <span class="font-bold truncate">{{ ev.title }}</span>
              <CheckCircle2 v-if="isCompleted(ev.id)" :size="11" class="shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- AGENDA / TIMELINE VIEW -->
    <div v-else class="rounded-2xl border border-zinc-300 bg-white p-6 shadow-clean-md space-y-4">
      <div class="flex items-center justify-between border-b border-zinc-200 pb-3">
        <h3 class="text-xs font-bold uppercase tracking-wider text-zinc-950">Rangkaian Aktivitas Budidaya Lengkap</h3>
        <span class="font-mono text-xs text-zinc-500">{{ filteredEvents.length }} Kegiatan Terjadwal</span>
      </div>

      <div class="divide-y divide-zinc-200">
        <div
          v-for="ev in filteredEvents"
          :key="ev.id"
          class="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/70 px-3 rounded-xl transition"
          :class="isCompleted(ev.id) ? 'bg-zinc-50/50' : ''"
        >
          <div class="flex items-start gap-3.5">
            <!-- Completion Checkbox -->
            <button
              type="button"
              @click="toggleCompletion(ev.id)"
              class="mt-1 flex h-5 w-5 items-center justify-center rounded-md border transition shrink-0"
              :class="isCompleted(ev.id) ? 'bg-zinc-950 border-zinc-950 text-white' : 'border-zinc-300 hover:border-zinc-950 bg-white'"
            >
              <Check :size="13" v-if="isCompleted(ev.id)" />
            </button>

            <!-- Day Offset Badge -->
            <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 text-white font-mono text-xs font-bold shrink-0">
              {{ ev.dayOffset >= 0 ? `+${ev.dayOffset}` : ev.dayOffset }}
            </div>

            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-zinc-950" :class="isCompleted(ev.id) ? 'line-through text-zinc-400' : ''">
                  {{ ev.title }}
                </span>
                <span class="rounded px-1.5 py-0.2 text-[9px] font-mono uppercase font-bold border" :class="getEventStyle(ev.category)">
                  {{ ev.category }}
                </span>
                <span v-if="ev.isCustom" class="rounded bg-zinc-200 text-zinc-800 px-1 py-0.2 text-[8px] font-mono">
                  Catatan Anda
                </span>
              </div>
              <p class="text-xs text-zinc-600 mt-1 leading-relaxed">{{ ev.description }}</p>
            </div>
          </div>

          <div class="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 font-mono text-xs pl-8 sm:pl-0">
            <span class="font-bold text-zinc-950 block">{{ formatFullDate(ev.date) }}</span>
            <span class="text-[11px] text-zinc-400">HST {{ ev.dayOffset }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Event Detail Modal -->
    <div
      v-if="selectedEvent"
      class="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 p-4 backdrop-blur-sm"
      @click.self="selectedEvent = null"
    >
      <div class="w-full max-w-md rounded-2xl border border-zinc-300 bg-white p-6 shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-zinc-200 pb-3">
          <div class="flex items-center gap-2">
            <Calendar :size="18" class="text-zinc-950" />
            <h3 class="text-sm font-bold text-zinc-950">{{ selectedEvent.title }}</h3>
          </div>
          <button @click="selectedEvent = null" class="text-zinc-400 hover:text-zinc-700">
            <X :size="18" />
          </button>
        </div>

        <div class="space-y-3 text-xs font-mono">
          <div class="flex justify-between">
            <span class="text-zinc-500">Tanggal Kegiatan:</span>
            <span class="font-bold text-zinc-950">{{ formatFullDate(selectedEvent.date) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-zinc-500">Kategori:</span>
            <span class="font-bold text-zinc-950">{{ selectedEvent.category }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-zinc-500">Fase Tanaman:</span>
            <span class="font-bold text-zinc-950">HST {{ selectedEvent.dayOffset }}</span>
          </div>
          <div class="flex justify-between items-center pt-1 border-t border-zinc-100">
            <span class="text-zinc-500">Status Penyelesaian:</span>
            <button
              type="button"
              @click="toggleCompletion(selectedEvent.id)"
              class="rounded-lg px-2 py-1 text-xs font-bold border transition"
              :class="isCompleted(selectedEvent.id) ? 'bg-zinc-950 text-white border-zinc-950' : 'bg-zinc-100 text-zinc-800 border-zinc-300'"
            >
              {{ isCompleted(selectedEvent.id) ? '✓ Selesai' : 'Belum Selesai' }}
            </button>
          </div>

          <div class="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 space-y-1.5">
            <span class="font-bold text-zinc-950 block text-[11px] uppercase">Panduan Teknis / Catatan:</span>
            <p class="text-zinc-700 leading-relaxed font-sans text-xs">{{ selectedEvent.description }}</p>
          </div>
        </div>

        <div class="flex gap-2">
          <button
            v-if="selectedEvent.isCustom"
            type="button"
            @click="deleteCustomEvent(selectedEvent.id)"
            class="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-bold text-red-600 hover:bg-red-100 transition"
          >
            Hapus Catatan
          </button>
          <button
            type="button"
            @click="selectedEvent = null"
            class="flex-1 rounded-xl bg-zinc-950 py-2.5 text-xs font-bold text-white hover:bg-zinc-800 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Tambah Aktivitas Manual Baru -->
    <div
      v-if="showAddCustomModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 p-4 backdrop-blur-sm"
      @click.self="showAddCustomModal = false"
    >
      <div class="w-full max-w-md rounded-2xl border border-zinc-300 bg-white p-6 shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-zinc-200 pb-3">
          <div class="flex items-center gap-2">
            <Plus :size="18" class="text-zinc-950" />
            <h3 class="text-sm font-bold text-zinc-950">Tandai Aktivitas / Catatan Tanam Baru</h3>
          </div>
          <button @click="showAddCustomModal = false" class="text-zinc-400 hover:text-zinc-700">
            <X :size="18" />
          </button>
        </div>

        <form @submit.prevent="saveCustomEvent" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-zinc-700 uppercase mb-1">Judul Kegiatan / Penandaan:</label>
            <input
              v-model="newCustomForm.title"
              type="text"
              required
              placeholder="Contoh: Beli Benih Inpari 32 / Cek Pompa Air"
              class="w-full rounded-xl border border-zinc-300 p-2.5 font-bold text-zinc-950 focus:border-zinc-950 focus:outline-none"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-zinc-700 uppercase mb-1">Tanggal Kegiatan:</label>
              <input
                v-model="newCustomForm.date"
                type="date"
                required
                class="w-full rounded-xl border border-zinc-300 p-2.5 font-mono text-zinc-950 focus:border-zinc-950 focus:outline-none"
              />
            </div>

            <div>
              <label class="block font-bold text-zinc-700 uppercase mb-1">Kategori:</label>
              <select
                v-model="newCustomForm.category"
                class="w-full rounded-xl border border-zinc-300 p-2.5 font-bold text-zinc-950 focus:border-zinc-950 focus:outline-none"
              >
                <option value="Tanam">Tanam</option>
                <option value="Pupuk">Pemupukan</option>
                <option value="Irigasi">Irigasi / Air</option>
                <option value="PHT/Hama">PHT / Hama</option>
                <option value="Olah Lahan">Olah Lahan</option>
                <option value="Panen">Panen</option>
                <option value="Catatan">Catatan Khusus</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block font-bold text-zinc-700 uppercase mb-1">Panduan / Catatan Khusus:</label>
            <textarea
              v-model="newCustomForm.description"
              rows="3"
              placeholder="Tambahkan detail dosis, petugas lapangan, atau catatan cuaca..."
              class="w-full rounded-xl border border-zinc-300 p-2.5 text-zinc-950 focus:border-zinc-950 focus:outline-none"
            ></textarea>
          </div>

          <div class="flex gap-2 pt-2">
            <button
              type="button"
              @click="showAddCustomModal = false"
              class="flex-1 rounded-xl border border-zinc-300 py-2.5 text-xs font-bold text-zinc-800 hover:bg-zinc-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              class="flex-1 rounded-xl bg-zinc-950 py-2.5 text-xs font-bold text-white hover:bg-zinc-800 transition"
            >
              Simpan ke Kalender
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Download,
  Sliders,
  Sprout,
  ChevronLeft,
  ChevronRight,
  Calendar,
  X,
  Plus,
  Check,
  CheckCircle2
} from '@lucide/vue'
import type { ScenarioResult } from '~/types/simulation'

definePageMeta({
  middleware: 'auth'
})

const { currentScenario, savedSimulations, runSimulation } = useSimulation()

const activeScenario = ref<ScenarioResult | null>(null)
const viewMode = ref<'month' | 'agenda'>('month')
const selectedEvent = ref<any | null>(null)
const showAddCustomModal = ref(false)
const selectedCategoryFilter = ref('Semua')

const categoryFilters = ['Semua', 'Tanam', 'Pupuk', 'Irigasi', 'PHT/Hama', 'Panen', 'Catatan']

const now = new Date()
const currentMonth = ref(now.getMonth())
const currentYear = ref(now.getFullYear())

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

interface AgriEvent {
  id: string
  date: string
  dayOffset: number
  title: string
  category: 'Tanam' | 'Pupuk' | 'Irigasi' | 'PHT/Hama' | 'Panen' | 'Olah Lahan' | 'Catatan'
  description: string
  isCustom?: boolean
}

// Completed task ids in localStorage
const completedEventIds = ref<string[]>([])
// Custom events stored in localStorage
const customEvents = ref<AgriEvent[]>([])

const newCustomForm = ref({
  title: '',
  date: new Date().toISOString().split('T')[0],
  category: 'Catatan' as AgriEvent['category'],
  description: ''
})

const isCompleted = (id: string) => {
  return completedEventIds.value.includes(id)
}

const toggleCompletion = (id: string) => {
  if (completedEventIds.value.includes(id)) {
    completedEventIds.value = completedEventIds.value.filter(x => x !== id)
  } else {
    completedEventIds.value.push(id)
  }
  if (import.meta.client) {
    localStorage.setItem('taniaman_calendar_completed', JSON.stringify(completedEventIds.value))
  }
}

const completedCount = computed(() => {
  return eventsList.value.filter(e => completedEventIds.value.includes(e.id)).length
})

const eventsList = computed<AgriEvent[]>(() => {
  const list: AgriEvent[] = []

  if (activeScenario.value) {
    const plantDateStr = activeScenario.value.planting_date
    const plantDate = new Date(plantDateStr)
    const crop = activeScenario.value.crop

    const addEvent = (offsetDays: number, title: string, category: AgriEvent['category'], desc: string) => {
      const d = new Date(plantDate.getTime() + offsetDays * 24 * 60 * 60 * 1000)
      list.push({
        id: 'auto_' + offsetDays + '_' + crop.slug,
        date: d.toISOString().split('T')[0],
        dayOffset: offsetDays,
        title,
        category,
        description: desc
      })
    }

    // Generate automated events from agronomy engine
    addEvent(-10, 'Pengolahan Tanah & Tebar Dolomit', 'Olah Lahan', 'Bajak tanah sedalam 20 cm, ratakan tanah, dan taburkan dolomit jika pH tanah masam (<6.0).')
    addEvent(0, `Hari Tanam: ${crop.name}`, 'Tanam', `Mulai pindah tanam bibit ${crop.name} ke bedengan/lahan dengan jarak tanam rekomendasi Kementan.`)
    addEvent(7, 'Pemupukan Dasar & Penyulaman Bibit', 'Pupuk', 'Aplikasi pupuk dasar NPK/Urea dan ganti bibit yang mati atau kerdil.')
    addEvent(21, 'Pemupukan Susulan I (Urea + NPK)', 'Pupuk', 'Memicu pembentukan anakan produktif dan percepatan pertumbuhan kanopi.')
    addEvent(35, 'Pengendalian Hama & Penyiangan Gulma', 'PHT/Hama', 'Lakukan penyiangan mekanis dan monitor serangan penggerek batang/ulat grayak.')
    addEvent(45, 'Pemupukan Susulan II (Fase Bunga / Generatif)', 'Pupuk', 'Tambahkan Kalium untuk memperkuat malai/bunga dan ketahanan tangkai tanaman.')
    addEvent(60, 'Monitoring Irigasi Kritis Fase Pembungaan', 'Irigasi', 'Pastikan kelembapan air tercukupi (fase sangat sensitif terhadap cekaman kekeringan).')
    addEvent(80, 'Pengisian Bulir / Buah', 'Irigasi', 'Pertahankan kondisi macak-macak dan waspadai hama pengisap bulir/patek.')
    
    const duration = Math.round((crop.growth_days_min + crop.growth_days_max) / 2)
    addEvent(duration - 10, 'Pengeringan Lahan Pra-Panen', 'Irigasi', 'Hentikan suplai air 10 hari sebelum panen untuk mempercepat pematangan serempak.')
    addEvent(duration, `Estimasi Panen Raya: ${crop.name}`, 'Panen', `Kadar air bulir optimal. Lakukan pemanenan saat cuaca cerah di pagi hari.`)
  }

  // Add custom events
  customEvents.value.forEach(ce => {
    list.push(ce)
  })

  return list
})

const filteredEvents = computed(() => {
  let list = [...eventsList.value]
  if (selectedCategoryFilter.value !== 'Semua') {
    list = list.filter(e => e.category === selectedCategoryFilter.value)
  }
  return list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
})

const monthCells = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDayOfWeek = firstDay.getDay() // 0 = Sun
  const totalDays = lastDay.getDate()

  const cells = []
  const todayStr = new Date().toISOString().split('T')[0]

  // Previous month padding
  const prevLastDay = new Date(year, month, 0).getDate()
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevLastDay - i)
    const dStr = d.toISOString().split('T')[0]
    cells.push({
      dateStr: dStr,
      dayNum: d.getDate(),
      isCurrentMonth: false,
      isToday: dStr === todayStr
    })
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    const d = new Date(year, month, i)
    const dStr = d.toISOString().split('T')[0]
    cells.push({
      dateStr: dStr,
      dayNum: i,
      isCurrentMonth: true,
      isToday: dStr === todayStr
    })
  }

  // Next month padding to reach full 35 or 42 grid cells
  const remaining = 35 - cells.length > 0 ? 35 - cells.length : 42 - cells.length
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i)
    const dStr = d.toISOString().split('T')[0]
    cells.push({
      dateStr: dStr,
      dayNum: i,
      isCurrentMonth: false,
      isToday: dStr === todayStr
    })
  }

  return cells
})

const getFilteredEventsForDate = (dateStr: string) => {
  return filteredEvents.value.filter(e => e.date === dateStr)
}

const getEventStyle = (cat: AgriEvent['category']) => {
  if (cat === 'Tanam' || cat === 'Panen') return 'bg-zinc-950 text-white border-zinc-950'
  if (cat === 'Pupuk') return 'bg-zinc-200 text-zinc-950 border-zinc-400 font-bold'
  if (cat === 'Irigasi') return 'bg-zinc-100 text-zinc-900 border-zinc-300'
  if (cat === 'PHT/Hama') return 'bg-zinc-900 text-white border-zinc-900'
  return 'bg-zinc-100 text-zinc-800 border-zinc-200'
}

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const goToToday = () => {
  const d = new Date()
  currentMonth.value = d.getMonth()
  currentYear.value = d.getFullYear()
}

const openEventDetail = (ev: AgriEvent) => {
  selectedEvent.value = ev
}

const quickAddForDate = (dateStr: string) => {
  newCustomForm.value.date = dateStr
  showAddCustomModal.value = true
}

const saveCustomEvent = () => {
  if (!newCustomForm.value.title) return
  
  let offset = 0
  if (activeScenario.value) {
    const pDate = new Date(activeScenario.value.planting_date).getTime()
    const targetDate = new Date(newCustomForm.value.date).getTime()
    offset = Math.round((targetDate - pDate) / (1000 * 60 * 60 * 24))
  }

  const newEv: AgriEvent = {
    id: 'custom_' + Date.now(),
    date: newCustomForm.value.date,
    dayOffset: offset,
    title: newCustomForm.value.title,
    category: newCustomForm.value.category,
    description: newCustomForm.value.description || 'Catatan lapangan pengguna.',
    isCustom: true
  }

  customEvents.value.push(newEv)
  if (import.meta.client) {
    localStorage.setItem('taniaman_custom_calendar_events', JSON.stringify(customEvents.value))
  }

  showAddCustomModal.value = false
  newCustomForm.value.title = ''
  newCustomForm.value.description = ''
}

const deleteCustomEvent = (id: string) => {
  customEvents.value = customEvents.value.filter(e => e.id !== id)
  if (import.meta.client) {
    localStorage.setItem('taniaman_custom_calendar_events', JSON.stringify(customEvents.value))
  }
  selectedEvent.value = null
}

const switchScenario = (event: any) => {
  const selectedId = event.target.value
  const found = savedSimulations.value.find(s => s.id === selectedId)
  if (found) {
    activeScenario.value = found
    const pDate = new Date(found.planting_date)
    currentMonth.value = pDate.getMonth()
    currentYear.value = pDate.getFullYear()
  }
}

const formatFullDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

// Generate .ics calendar download file
const exportICalendar = () => {
  if (eventsList.value.length === 0) return

  let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Siap Tani//DSS Agronomy Calendar//ID\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\n"

  eventsList.value.forEach(ev => {
    const dFormatted = ev.date.replace(/-/g, '')
    icsContent += `BEGIN:VEVENT\n`
    icsContent += `UID:${ev.id}@siaptani.id\n`
    icsContent += `DTSTAMP:${dFormatted}T000000Z\n`
    icsContent += `DTSTART;VALUE=DATE:${dFormatted}\n`
    icsContent += `SUMMARY:${ev.title}\n`
    icsContent += `DESCRIPTION:${ev.description.replace(/\n/g, ' ')}\n`
    icsContent += `CATEGORIES:${ev.category}\n`
    icsContent += `STATUS:CONFIRMED\n`
    icsContent += `END:VEVENT\n`
  })

  icsContent += "END:VCALENDAR"

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Kalender_Agronomi_${activeScenario.value?.crop.slug || 'siaptani'}.ics`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

onMounted(async () => {
  // Load persisted completed tasks
  if (import.meta.client) {
    const storedCompleted = localStorage.getItem('taniaman_calendar_completed')
    if (storedCompleted) {
      try {
        completedEventIds.value = JSON.parse(storedCompleted)
      } catch (e) {}
    }
    const storedCustom = localStorage.getItem('taniaman_custom_calendar_events')
    if (storedCustom) {
      try {
        customEvents.value = JSON.parse(storedCustom)
      } catch (e) {}
    }
  }

  if (!currentScenario.value) {
    activeScenario.value = await runSimulation({
      location_name: 'Sidoarjo',
      latitude: -7.4478,
      longitude: 112.7183,
      crop_slug: 'padi',
      planting_date: '2026-10-15',
      land_area: 1000,
      is_baseline: true
    })
  } else {
    activeScenario.value = currentScenario.value
    const pDate = new Date(currentScenario.value.planting_date)
    currentMonth.value = pDate.getMonth()
    currentYear.value = pDate.getFullYear()
  }
})
</script>
