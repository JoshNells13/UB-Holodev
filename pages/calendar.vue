<template>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-forest-950/10 pb-5">
      <div>
        <div class="flex items-center gap-2">
          <span class="rounded bg-forest-950 px-2.5 py-0.5 font-mono text-[10px] font-extrabold text-gold-400 uppercase tracking-wider">
            AGRONOMY SCHEDULE & TRACKER
          </span>
          <span class="text-xs font-mono text-zinc-500">Kalender Aktivitas & Penandaan Tanam</span>
        </div>
        <h1 class="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-forest-950 uppercase">
          Kalender Tanam & Jadwal Lahan
        </h1>
        <p class="text-xs text-zinc-500 mt-0.5">Pantau tahapan budidaya tanaman hasil simulasi, tandai kegiatan lapangan, dan ekspor ke Google Calendar</p>
      </div>

      <!-- Action buttons -->
      <div class="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          @click="openAddModalWithDate()"
          class="flex items-center gap-1.5 rounded-xl bg-forest-950 px-4 py-2 text-xs font-extrabold text-white transition hover:bg-forest-900 shadow-xs ring-1 ring-forest-900 cursor-pointer"
        >
          <Plus :size="14" class="text-gold-400" />
          <span>Tandai Aktivitas Baru</span>
        </button>

        <button
          type="button"
          @click="exportICalendar"
          class="flex items-center gap-1.5 rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs font-bold text-zinc-800 transition hover:bg-forest-50 hover:border-forest-300 shadow-xs cursor-pointer"
        >
          <Download :size="14" class="text-forest-700" />
          <span>Ekspor ke Google Calendar (.ics)</span>
        </button>

        <NuxtLink
          to="/simulate"
          class="flex items-center gap-1.5 rounded-xl border border-zinc-300 bg-forest-50/50 px-3.5 py-2 text-xs font-bold text-forest-950 transition hover:bg-forest-100 shadow-xs"
        >
          <Sliders :size="14" class="text-forest-700" />
          <span>Ubah di Studio Simulasi</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Notification Toast if any -->
    <div
      v-if="calendarToast"
      class="rounded-2xl border p-3.5 text-xs font-mono font-bold flex items-center justify-between shadow-lg transition-all animate-in fade-in"
      :class="calendarToast.type === 'warning' ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-emerald-600 bg-forest-950 text-white'"
    >
      <div class="flex items-center gap-2.5">
        <AlertCircle v-if="calendarToast.type === 'warning'" :size="16" class="text-amber-600 shrink-0" />
        <BookmarkCheck v-else :size="16" class="text-gold-400 shrink-0" />
        <span>{{ calendarToast.message }}</span>
      </div>
      <button @click="calendarToast = null" class="opacity-70 hover:opacity-100 transition cursor-pointer ml-3">
        <X :size="14" />
      </button>
    </div>

    <!-- Active Crop Scenario Summary Banner & Switcher -->
    <div v-if="activeScenario" class="rounded-3xl border border-forest-950/10 bg-white p-6 shadow-premium flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div class="flex items-start sm:items-center gap-3.5">
        <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-950 text-gold-400 font-bold shrink-0 shadow-xs">
          <Sprout :size="24" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="rounded-full bg-forest-50 px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase text-forest-800 border border-forest-100">
              SIKLUS AKTIF TERPILIH
            </span>
            <span class="text-xs font-mono text-zinc-500">{{ activeScenario.location_name }}</span>
          </div>
          <h3 class="text-base sm:text-lg font-extrabold text-forest-950 mt-0.5">
            {{ activeScenario.crop.name }} — Tanggal Tanam: {{ formatFullDate(activeScenario.planting_date) }}
          </h3>
          <p class="text-xs text-zinc-600 font-mono">
            Luas Lahan: {{ activeScenario.land_area.toLocaleString('id-ID') }} m² • Skor DSS: <strong class="text-forest-950">{{ activeScenario.risk_breakdown.total_score }}/100 ({{ activeScenario.risk_breakdown.recommendation }})</strong>
          </p>
        </div>
      </div>

      <!-- Quick stats & progress -->
      <div class="flex flex-wrap items-center gap-3 lg:border-l lg:border-zinc-200 lg:pl-6">
        <div class="rounded-2xl bg-forest-50/50 border border-forest-100 p-3 text-center min-w-[120px]">
          <span class="block text-[9px] font-mono uppercase text-forest-700/80 font-bold">PROGRESS SELESAI</span>
          <span class="font-mono text-base font-extrabold text-forest-950">{{ completedCount }} / {{ eventsList.length }}</span>
          <span class="block text-[9px] font-mono text-zinc-500">Kegiatan Selesai</span>
        </div>

        <!-- Scenario Selector dropdown if saved items exist -->
        <div v-if="savedSimulations.length > 0" class="flex flex-col">
          <label class="text-[10px] font-mono uppercase font-bold text-zinc-500 mb-1">Ganti Skenario:</label>
          <select
            @change="switchScenario($event)"
            class="rounded-xl border border-zinc-300 bg-white px-3 py-1.5 text-xs font-bold text-zinc-900 focus:border-forest-950 focus:outline-none shadow-xs cursor-pointer"
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
    <div class="rounded-3xl border border-forest-950/10 bg-white p-4 shadow-premium flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <!-- Nav month -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="goToToday"
          class="rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-1.5 text-xs font-bold text-zinc-800 hover:bg-forest-50 hover:border-forest-300 transition cursor-pointer"
        >
          Hari Ini
        </button>
        <div class="flex items-center gap-1">
          <button
            type="button"
            @click="prevMonth"
            class="rounded-xl border border-zinc-200 p-1.5 text-zinc-600 hover:bg-forest-50 hover:text-forest-950 transition cursor-pointer"
            title="Bulan Sebelumnya"
          >
            <ChevronLeft :size="16" />
          </button>
          <button
            type="button"
            @click="nextMonth"
            class="rounded-xl border border-zinc-200 p-1.5 text-zinc-600 hover:bg-forest-50 hover:text-forest-950 transition cursor-pointer"
            title="Bulan Berikutnya"
          >
            <ChevronRight :size="16" />
          </button>
        </div>
        <h2 class="text-base font-extrabold text-forest-950 font-mono ml-2">
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
          class="rounded-xl px-3 py-1 font-bold transition whitespace-nowrap cursor-pointer"
          :class="selectedCategoryFilter === cat ? 'bg-forest-950 text-white shadow-xs' : 'bg-forest-50/50 text-zinc-700 hover:bg-forest-100 hover:text-forest-950'"
        >
          {{ cat }}
        </button>
      </div>

      <!-- View Switcher -->
      <div class="flex rounded-xl bg-forest-950/5 p-1 font-mono text-xs shrink-0 border border-forest-950/10">
        <button
          type="button"
          @click="viewMode = 'month'"
          class="rounded-lg px-3.5 py-1 font-bold transition cursor-pointer"
          :class="viewMode === 'month' ? 'bg-forest-950 text-white shadow-xs' : 'text-zinc-700 hover:text-forest-950'"
        >
          Bulan (Month)
        </button>
        <button
          type="button"
          @click="viewMode = 'agenda'"
          class="rounded-lg px-3.5 py-1 font-bold transition cursor-pointer"
          :class="viewMode === 'agenda' ? 'bg-forest-950 text-white shadow-xs' : 'text-zinc-700 hover:text-forest-950'"
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
          @click="handleCellClick(cell)"
          class="min-h-[110px] sm:min-h-[125px] p-1.5 sm:p-2 transition flex flex-col justify-between cursor-pointer"
          :class="[
            cell.isCurrentMonth ? (cell.isPast ? 'bg-zinc-100/50' : 'bg-white') : 'bg-zinc-50/40 text-zinc-400',
            cell.isPast ? 'opacity-85' : 'hover:bg-forest-50/40',
            selectedDate === cell.dateStr ? 'ring-2 ring-forest-900 bg-forest-50/50 z-10' : ''
          ]"
        >
          <!-- Date number & quick add -->
          <div class="flex items-center justify-between">
            <span
              class="flex h-6 w-6 items-center justify-center rounded-full font-mono text-xs font-bold"
              :class="[
                cell.isToday
                  ? 'bg-forest-950 text-gold-300 ring-2 ring-gold-400/40'
                  : (cell.isPast ? 'text-zinc-400' : 'text-zinc-900')
              ]"
            >
              {{ cell.dayNum }}
            </span>

            <!-- Quick Add Button (only available for today & future) -->
            <button
              v-if="cell.isCurrentMonth && !cell.isPast"
              type="button"
              @click.stop="openAddModalWithDate(cell.dateStr)"
              class="text-zinc-400 hover:text-forest-900 hover:bg-forest-100 p-1 rounded-md transition cursor-pointer"
              title="Tandai kegiatan di tanggal ini"
            >
              <Plus :size="13" />
            </button>
            <span
              v-else-if="cell.isCurrentMonth && cell.isPast"
              class="text-[9px] font-mono text-zinc-400 select-none"
              title="Tanggal sudah lewat"
            >
              Lewat
            </span>
          </div>

          <!-- Events in day -->
          <div class="mt-1 space-y-1 flex-1 overflow-y-auto max-h-24">
            <div
              v-for="ev in getFilteredEventsForDate(cell.dateStr)"
              :key="ev.id"
              @click.stop="openEventDetail(ev)"
              class="cursor-pointer rounded-lg border p-1 text-[10px] font-mono leading-tight transition flex items-center justify-between gap-1 shadow-2xs"
              :class="[
                getEventStyle(ev.category),
                getEventStatus(ev.id) === 'completed' ? 'opacity-60 line-through bg-zinc-100 border-zinc-300 text-zinc-500' : ''
              ]"
              :title="`${ev.title} (${getStatusLabel(getEventStatus(ev.id))})`"
            >
              <span class="font-bold truncate">{{ ev.title }}</span>
              <span
                class="h-1.5 w-1.5 rounded-full shrink-0"
                :class="getStatusDotColor(getEventStatus(ev.id))"
              />
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
          @click="openEventDetail(ev)"
          class="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/70 px-3 rounded-xl transition cursor-pointer"
          :class="getEventStatus(ev.id) === 'completed' ? 'bg-zinc-50/40' : ''"
        >
          <div class="flex items-start gap-3.5">
            <!-- Day Offset Badge -->
            <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-950 text-gold-300 font-mono text-xs font-bold shrink-0">
              {{ ev.dayOffset >= 0 ? `+${ev.dayOffset}` : ev.dayOffset }}
            </div>

            <div>
              <div class="flex items-center gap-2">
                <span
                  class="text-xs font-bold text-zinc-950"
                  :class="getEventStatus(ev.id) === 'completed' ? 'line-through text-zinc-400' : ''"
                >
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

          <div class="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 font-mono text-xs pl-8 sm:pl-0 gap-1.5">
            <span class="font-bold text-zinc-950 block">{{ formatFullDate(ev.date) }}</span>
            <div class="flex items-center gap-1.5">
              <span class="text-[11px] text-zinc-400">HST {{ ev.dayOffset }}</span>
              <span
                class="rounded-full px-2 py-0.5 text-[9px] font-bold border"
                :class="getStatusBadgeClass(getEventStatus(ev.id))"
              >
                {{ getStatusLabel(getEventStatus(ev.id)) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Event Detail & Status Management Modal -->
    <div
      v-if="selectedEvent"
      class="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-150"
      @click.self="selectedEvent = null"
    >
      <div class="w-full max-w-md rounded-2xl border border-zinc-300 bg-white p-6 shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-zinc-200 pb-3">
          <div class="flex items-center gap-2">
            <Calendar :size="18" class="text-forest-950" />
            <h3 class="text-sm font-bold text-zinc-950">{{ selectedEvent.title }}</h3>
          </div>
          <button @click="selectedEvent = null" class="text-zinc-400 hover:text-zinc-700 cursor-pointer">
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

          <!-- Status Selector Buttons -->
          <div class="pt-2 border-t border-zinc-100 space-y-2">
            <span class="text-zinc-600 font-bold block uppercase text-[10px]">Ubah Status Aktivitas:</span>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                @click="updateEventStatus(selectedEvent.id, 'pending')"
                class="flex items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-bold transition cursor-pointer"
                :class="getEventStatus(selectedEvent.id) === 'pending' ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs' : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'"
              >
                <Clock :size="13" />
                <span>Belum Dimulai</span>
              </button>
              <button
                type="button"
                @click="updateEventStatus(selectedEvent.id, 'in_progress')"
                class="flex items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-bold transition cursor-pointer"
                :class="getEventStatus(selectedEvent.id) === 'in_progress' ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : 'bg-blue-50/50 text-blue-800 border-blue-200 hover:bg-blue-100'"
              >
                <RotateCw :size="13" />
                <span>Sedang Berjalan</span>
              </button>
              <button
                type="button"
                @click="updateEventStatus(selectedEvent.id, 'completed')"
                class="flex items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-bold transition cursor-pointer"
                :class="getEventStatus(selectedEvent.id) === 'completed' ? 'bg-[#0C2B1C] text-gold-300 border-[#0C2B1C] shadow-xs' : 'bg-emerald-50/50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'"
              >
                <CheckCircle2 :size="13" />
                <span>Selesai Dilakukan</span>
              </button>
              <button
                type="button"
                @click="updateEventStatus(selectedEvent.id, 'delayed')"
                class="flex items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-bold transition cursor-pointer"
                :class="getEventStatus(selectedEvent.id) === 'delayed' ? 'bg-amber-600 text-white border-amber-600 shadow-xs' : 'bg-amber-50/50 text-amber-800 border-amber-200 hover:bg-amber-100'"
              >
                <AlertCircle :size="13" />
                <span>Tertunda</span>
              </button>
            </div>
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
            class="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-bold text-red-600 hover:bg-red-100 transition cursor-pointer"
          >
            Hapus Catatan
          </button>
          <button
            type="button"
            @click="selectedEvent = null"
            class="flex-1 rounded-xl bg-forest-950 py-2.5 text-xs font-bold text-white hover:bg-forest-900 transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Tambah Aktivitas Manual Baru -->
    <div
      v-if="showAddCustomModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-150"
      @click.self="showAddCustomModal = false"
    >
      <div class="w-full max-w-md rounded-2xl border border-zinc-300 bg-white p-6 shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-zinc-200 pb-3">
          <div class="flex items-center gap-2">
            <Plus :size="18" class="text-forest-950" />
            <h3 class="text-sm font-bold text-zinc-950">Tandai Aktivitas / Catatan Tanam Baru</h3>
          </div>
          <button @click="showAddCustomModal = false" class="text-zinc-400 hover:text-zinc-700 cursor-pointer">
            <X :size="18" />
          </button>
        </div>

        <div v-if="formError" class="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 font-medium flex items-center gap-2">
          <AlertCircle :size="14" class="shrink-0 text-red-600" />
          <span>{{ formError }}</span>
        </div>

        <form @submit.prevent="saveCustomEvent" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-zinc-700 uppercase mb-1">Judul Kegiatan / Penandaan:</label>
            <input
              v-model="newCustomForm.title"
              type="text"
              required
              placeholder="Contoh: Beli Benih Inpari 32 / Cek Pompa Air"
              class="w-full rounded-xl border border-zinc-300 p-2.5 font-bold text-zinc-950 focus:border-forest-950 focus:outline-none"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-zinc-700 uppercase mb-1">Tanggal Kegiatan:</label>
              <input
                v-model="newCustomForm.date"
                type="date"
                :min="todayStr"
                required
                class="w-full rounded-xl border border-zinc-300 p-2.5 font-mono text-zinc-950 focus:border-forest-950 focus:outline-none"
              />
              <p class="text-[10px] text-zinc-500 font-mono mt-1">Minimal: {{ todayStr }}</p>
            </div>

            <div>
              <label class="block font-bold text-zinc-700 uppercase mb-1">Kategori:</label>
              <select
                v-model="newCustomForm.category"
                class="w-full rounded-xl border border-zinc-300 p-2.5 font-bold text-zinc-950 focus:border-forest-950 focus:outline-none"
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
              class="w-full rounded-xl border border-zinc-300 p-2.5 text-zinc-950 focus:border-forest-950 focus:outline-none"
            ></textarea>
          </div>

          <div class="flex gap-2 pt-2">
            <button
              type="button"
              @click="showAddCustomModal = false"
              class="flex-1 rounded-xl border border-zinc-300 py-2.5 text-xs font-bold text-zinc-800 hover:bg-zinc-100 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              class="flex-1 rounded-xl bg-forest-950 py-2.5 text-xs font-bold text-white hover:bg-forest-900 transition cursor-pointer"
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
  CheckCircle2,
  Clock,
  RotateCw,
  AlertCircle,
  BookmarkCheck
} from '@lucide/vue'
import type { ScenarioResult } from '~/types/simulation'

definePageMeta({
  middleware: 'auth'
})

const { currentScenario, savedSimulations, runSimulation } = useSimulation()

export type EventStatus = 'pending' | 'in_progress' | 'completed' | 'delayed'

interface AgriEvent {
  id: string
  date: string // YYYY-MM-DD
  dayOffset: number
  title: string
  category: 'Tanam' | 'Pupuk' | 'Irigasi' | 'PHT/Hama' | 'Panen' | 'Olah Lahan' | 'Catatan'
  description: string
  isCustom?: boolean
}

// Timezone-safe local date string conversion
const toLocalDateStr = (d: Date): string => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Timezone-safe YYYY-MM-DD date parsing to local Date object
const parseDateString = (dateStr: string): Date => {
  if (!dateStr) return new Date()
  const parts = dateStr.split('-').map(Number)
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return new Date(parts[0], parts[1] - 1, parts[2])
  }
  return new Date(dateStr)
}

const todayStr = computed(() => toLocalDateStr(new Date()))

const activeScenario = ref<ScenarioResult | null>(null)
const viewMode = ref<'month' | 'agenda'>('month')
const selectedEvent = ref<AgriEvent | null>(null)
const selectedDate = ref<string | null>(null)
const showAddCustomModal = ref(false)
const formError = ref('')
const calendarToast = ref<{ type: 'success' | 'warning'; message: string } | null>(null)
const selectedCategoryFilter = ref('Semua')

const categoryFilters = ['Semua', 'Tanam', 'Pupuk', 'Irigasi', 'PHT/Hama', 'Olah Lahan', 'Panen', 'Catatan']

const now = new Date()
const currentMonth = ref(now.getMonth())
const currentYear = ref(now.getFullYear())

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

// Status map stored in localStorage
const eventStatusMap = ref<Record<string, EventStatus>>({})
// Custom events stored in localStorage
const customEvents = ref<AgriEvent[]>([])

const newCustomForm = ref({
  title: '',
  date: toLocalDateStr(new Date()),
  category: 'Catatan' as AgriEvent['category'],
  description: ''
})

const getEventStatus = (id: string): EventStatus => {
  return eventStatusMap.value[id] || 'pending'
}

const updateEventStatus = (id: string, status: EventStatus) => {
  eventStatusMap.value = {
    ...eventStatusMap.value,
    [id]: status
  }
  if (import.meta.client) {
    localStorage.setItem('taniaman_calendar_event_status', JSON.stringify(eventStatusMap.value))
  }
}

const getStatusLabel = (status: EventStatus): string => {
  switch (status) {
    case 'completed': return 'Selesai'
    case 'in_progress': return 'Sedang Berjalan'
    case 'delayed': return 'Tertunda'
    case 'pending':
    default: return 'Belum Dimulai'
  }
}

const getStatusBadgeClass = (status: EventStatus): string => {
  switch (status) {
    case 'completed': return 'bg-emerald-50 text-emerald-800 border-emerald-300'
    case 'in_progress': return 'bg-blue-50 text-blue-800 border-blue-300'
    case 'delayed': return 'bg-amber-50 text-amber-800 border-amber-300'
    case 'pending':
    default: return 'bg-zinc-100 text-zinc-700 border-zinc-300'
  }
}

const getStatusDotColor = (status: EventStatus): string => {
  switch (status) {
    case 'completed': return 'bg-emerald-500'
    case 'in_progress': return 'bg-blue-500'
    case 'delayed': return 'bg-amber-500'
    case 'pending':
    default: return 'bg-zinc-400'
  }
}

const completedCount = computed(() => {
  return eventsList.value.filter(e => getEventStatus(e.id) === 'completed').length
})

const eventsList = computed<AgriEvent[]>(() => {
  const list: AgriEvent[] = []

  if (activeScenario.value) {
    const plantDateStr = activeScenario.value.planting_date
    const plantDate = parseDateString(plantDateStr)
    const crop = activeScenario.value.crop

    const addEvent = (offsetDays: number, title: string, category: AgriEvent['category'], desc: string) => {
      const d = new Date(plantDate.getFullYear(), plantDate.getMonth(), plantDate.getDate() + offsetDays)
      list.push({
        id: 'auto_' + offsetDays + '_' + crop.slug,
        date: toLocalDateStr(d),
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
  return list.sort((a, b) => parseDateString(a.date).getTime() - parseDateString(b.date).getTime())
})

interface MonthCell {
  dateStr: string
  dayNum: number
  isCurrentMonth: boolean
  isToday: boolean
  isPast: boolean
}

const monthCells = computed<MonthCell[]>(() => {
  const year = currentYear.value
  const month = currentMonth.value

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDayOfWeek = firstDay.getDay() // 0 = Sun
  const totalDays = lastDay.getDate()

  const cells: MonthCell[] = []
  const today = todayStr.value

  // Previous month padding
  const prevLastDay = new Date(year, month, 0).getDate()
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevLastDay - i)
    const dStr = toLocalDateStr(d)
    cells.push({
      dateStr: dStr,
      dayNum: d.getDate(),
      isCurrentMonth: false,
      isToday: dStr === today,
      isPast: dStr < today
    })
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    const d = new Date(year, month, i)
    const dStr = toLocalDateStr(d)
    cells.push({
      dateStr: dStr,
      dayNum: i,
      isCurrentMonth: true,
      isToday: dStr === today,
      isPast: dStr < today
    })
  }

  // Next month padding to reach full 35 or 42 grid cells
  const remaining = 35 - cells.length > 0 ? 35 - cells.length : (cells.length < 42 ? 42 - cells.length : 0)
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i)
    const dStr = toLocalDateStr(d)
    cells.push({
      dateStr: dStr,
      dayNum: i,
      isCurrentMonth: false,
      isToday: dStr === today,
      isPast: dStr < today
    })
  }

  return cells
})

const getFilteredEventsForDate = (dateStr: string) => {
  return filteredEvents.value.filter(e => e.date === dateStr)
}

const getEventStyle = (cat: AgriEvent['category']) => {
  if (cat === 'Tanam' || cat === 'Panen') return 'bg-forest-950 text-gold-300 border-forest-950'
  if (cat === 'Pupuk') return 'bg-emerald-50 text-emerald-950 border-emerald-300 font-bold'
  if (cat === 'Irigasi') return 'bg-blue-50 text-blue-900 border-blue-300'
  if (cat === 'PHT/Hama') return 'bg-zinc-900 text-white border-zinc-900'
  if (cat === 'Olah Lahan') return 'bg-amber-50 text-amber-950 border-amber-300'
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
  selectedDate.value = todayStr.value
}

const handleCellClick = (cell: MonthCell) => {
  selectedDate.value = cell.dateStr

  if (cell.isPast) {
    calendarToast.value = {
      type: 'warning',
      message: `Tanggal ${formatFullDate(cell.dateStr)} sudah terlewat. Kegiatan baru hanya dapat ditambahkan mulai hari ini (${formatFullDate(todayStr.value)}).`
    }
    return
  }

  openAddModalWithDate(cell.dateStr)
}

const openEventDetail = (ev: AgriEvent) => {
  selectedEvent.value = ev
}

const openAddModalWithDate = (dateStr?: string) => {
  formError.value = ''
  let targetDate = dateStr || selectedDate.value || todayStr.value

  // Past date validation
  if (targetDate < todayStr.value) {
    targetDate = todayStr.value
  }

  selectedDate.value = targetDate
  newCustomForm.value.date = targetDate
  showAddCustomModal.value = true
}

const saveCustomEvent = () => {
  formError.value = ''
  const titleTrimmed = newCustomForm.value.title.trim()
  if (!titleTrimmed) {
    formError.value = 'Judul kegiatan wajib diisi.'
    return
  }

  if (newCustomForm.value.date < todayStr.value) {
    formError.value = `Tidak dapat menambahkan kegiatan pada tanggal yang sudah terlewat (${formatFullDate(newCustomForm.value.date)}). Minimal tanggal hari ini.`
    return
  }

  let offset = 0
  if (activeScenario.value) {
    const pDate = parseDateString(activeScenario.value.planting_date).getTime()
    const targetDate = parseDateString(newCustomForm.value.date).getTime()
    offset = Math.round((targetDate - pDate) / (1000 * 60 * 60 * 24))
  }

  const newEv: AgriEvent = {
    id: 'custom_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    date: newCustomForm.value.date,
    dayOffset: offset,
    title: titleTrimmed,
    category: newCustomForm.value.category,
    description: newCustomForm.value.description?.trim() || 'Catatan lapangan pengguna.',
    isCustom: true
  }

  customEvents.value = [...customEvents.value, newEv]
  if (import.meta.client) {
    localStorage.setItem('taniaman_custom_calendar_events', JSON.stringify(customEvents.value))
  }

  // Switch month if added event is in another month so user can see it
  const savedDate = parseDateString(newCustomForm.value.date)
  currentMonth.value = savedDate.getMonth()
  currentYear.value = savedDate.getFullYear()
  selectedDate.value = newCustomForm.value.date

  showAddCustomModal.value = false
  newCustomForm.value.title = ''
  newCustomForm.value.description = ''

  calendarToast.value = {
    type: 'success',
    message: `Kegiatan "${newEv.title}" berhasil ditambahkan ke tanggal ${formatFullDate(newEv.date)}!`
  }
}

const deleteCustomEvent = (id: string) => {
  customEvents.value = customEvents.value.filter(e => e.id !== id)
  if (import.meta.client) {
    localStorage.setItem('taniaman_custom_calendar_events', JSON.stringify(customEvents.value))
  }
  selectedEvent.value = null
  calendarToast.value = {
    type: 'success',
    message: 'Catatan kegiatan berhasil dihapus.'
  }
}

const switchScenario = (event: any) => {
  const selectedId = event.target.value
  const found = savedSimulations.value.find(s => s.id === selectedId)
  if (found) {
    activeScenario.value = found
    const pDate = parseDateString(found.planting_date)
    currentMonth.value = pDate.getMonth()
    currentYear.value = pDate.getFullYear()
  }
}

const formatFullDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const d = parseDateString(dateStr)
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
  // Load persisted status & custom events
  if (import.meta.client) {
    const storedStatus = localStorage.getItem('taniaman_calendar_event_status')
    if (storedStatus) {
      try {
        eventStatusMap.value = JSON.parse(storedStatus)
      } catch (e) {}
    } else {
      // Fallback from old completed array if present
      const storedCompleted = localStorage.getItem('taniaman_calendar_completed')
      if (storedCompleted) {
        try {
          const arr: string[] = JSON.parse(storedCompleted)
          const map: Record<string, EventStatus> = {}
          arr.forEach(id => { map[id] = 'completed' })
          eventStatusMap.value = map
        } catch (e) {}
      }
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
      planting_date: '2026-10-01',
      land_area: 1000,
      is_baseline: true
    })
    if (activeScenario.value) {
      const pDate = parseDateString(activeScenario.value.planting_date)
      currentMonth.value = pDate.getMonth()
      currentYear.value = pDate.getFullYear()
    }
  } else {
    activeScenario.value = currentScenario.value
    const pDate = parseDateString(currentScenario.value.planting_date)
    currentMonth.value = pDate.getMonth()
    currentYear.value = pDate.getFullYear()
  }
})
</script>
