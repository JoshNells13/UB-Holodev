<template>
  <div class="rounded-2xl border border-zinc-300 bg-white p-6 shadow-clean-md space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 pb-4">
      <div class="flex items-center gap-2">
        <div class="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-950 text-white">
          <BookOpen :size="16" />
        </div>
        <div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-zinc-950">Analisis Agronomi Mendalam & Proyeksi Finansial</h3>
          <p class="text-[11px] text-zinc-500">Panduan siklus fase tanam, neraca air harian, rekomendasi pemupukan presisi, dan estimasi ROI</p>
        </div>
      </div>

      <!-- Tab selection inside card -->
      <div class="flex rounded-lg bg-zinc-100 p-1 font-mono text-[11px]">
        <button
          v-for="t in tabs"
          :key="t.id"
          type="button"
          @click="activeTab = t.id"
          class="rounded-md px-2.5 py-1 font-semibold transition"
          :class="activeTab === t.id ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-600 hover:text-zinc-950'"
        >
          {{ t.label }}
        </button>
      </div>
    </div>

    <!-- TAB 1: SIKLUS & FASE PERTUMBUHAN -->
    <div v-if="activeTab === 'stages'" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="stage in plan.lifecycle_stages"
          :key="stage.stage_number"
          class="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 space-y-2.5"
        >
          <div class="flex items-center justify-between border-b border-zinc-200 pb-2">
            <span class="rounded bg-zinc-950 px-2 py-0.5 font-mono text-[10px] font-bold text-white uppercase">
              Fase {{ stage.stage_number }}: HST {{ stage.day_start }}–{{ stage.day_end }}
            </span>
            <span
              class="rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase border"
              :class="stage.water_need_status === 'Critical' ? 'bg-zinc-900 text-white border-zinc-950' : 'bg-zinc-200 text-zinc-800 border-zinc-300'"
            >
              Air: {{ stage.water_need_status }}
            </span>
          </div>

          <h4 class="text-xs font-bold text-zinc-950">{{ stage.name }}</h4>
          <p class="text-[11px] text-zinc-600 leading-relaxed font-mono">{{ stage.temperature_sensitivity }}</p>

          <!-- Key activities -->
          <div class="pt-1 text-[11px] space-y-1">
            <span class="font-bold text-zinc-900 block text-[10px] uppercase font-mono">Tindakan Wajib Petani:</span>
            <ul class="space-y-0.5 text-zinc-600">
              <li v-for="(act, idx) in stage.key_activities" :key="idx" class="flex items-start gap-1.5">
                <span class="text-zinc-400 font-bold">•</span>
                <span>{{ act }}</span>
              </li>
            </ul>
          </div>

          <!-- Risk alerts -->
          <div class="rounded-lg bg-zinc-100 p-2 text-[10px] text-zinc-700 font-mono border border-zinc-200">
            <span class="font-bold text-zinc-950">Potensi Cekaman: </span>
            <span>{{ stage.potential_risks.join(', ') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: NERACA AIR & JADWAL PENGAIRAN -->
    <div v-else-if="activeTab === 'water'" class="space-y-5">
      <!-- Water Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div class="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5">
          <span class="block text-[10px] font-mono text-zinc-500 uppercase">Kebutuhan Air Tanaman</span>
          <span class="mt-1 block font-mono text-2xl font-extrabold text-zinc-950">{{ plan.soil_water_balance.total_crop_water_need_mm }} mm</span>
          <span class="text-[10px] font-mono text-zinc-400">Total volume agronomis</span>
        </div>
        <div class="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5">
          <span class="block text-[10px] font-mono text-zinc-500 uppercase">Proyeksi Curah Hujan</span>
          <span class="mt-1 block font-mono text-2xl font-extrabold text-zinc-950">{{ plan.soil_water_balance.total_projected_rainfall_mm }} mm</span>
          <span class="text-[10px] font-mono text-zinc-400">Akumulasi iklim musim</span>
        </div>
        <div class="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5">
          <span class="block text-[10px] font-mono text-zinc-500 uppercase">Irigasi Suplemen Dibutuhkan</span>
          <span class="mt-1 block font-mono text-2xl font-extrabold text-zinc-950">{{ plan.soil_water_balance.irrigation_needed_m3.toLocaleString('id-ID') }} m³</span>
          <span class="text-[10px] font-mono text-zinc-400">Status: {{ plan.soil_water_balance.water_balance_status }}</span>
        </div>
      </div>

      <!-- Weekly Schedule Table -->
      <div class="rounded-xl border border-zinc-200 overflow-hidden">
        <div class="bg-zinc-50 p-3 border-b border-zinc-200 font-mono text-xs font-bold text-zinc-950 uppercase">
          Jadwal Volume Irigasi Berkala per Pekan
        </div>
        <table class="w-full text-left text-xs font-mono">
          <thead class="bg-zinc-100 text-[10px] uppercase text-zinc-500 border-b border-zinc-200">
            <tr>
              <th class="py-2 px-3">Pekan</th>
              <th class="py-2 px-3">Hari Setelah Tanam (HST)</th>
              <th class="py-2 px-3">Volume Air (m³)</th>
              <th class="py-2 px-3">Instruksi Pengairan</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-200">
            <tr v-for="w in plan.soil_water_balance.weekly_irrigation_schedule" :key="w.week">
              <td class="py-2.5 px-3 font-bold text-zinc-950">Minggu ke-{{ w.week }}</td>
              <td class="py-2.5 px-3 text-zinc-600">{{ w.days }}</td>
              <td class="py-2.5 px-3 font-bold text-zinc-950">{{ w.amount_m3 }} m³</td>
              <td class="py-2.5 px-3 text-zinc-600">{{ w.note }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 3: PROYEKSI FINANSIAL & ESTIMASI PANEN -->
    <div v-else-if="activeTab === 'finance'" class="space-y-5">
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div class="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5">
          <span class="block text-[10px] font-mono text-zinc-500 uppercase">Estimasi Panen</span>
          <span class="mt-1 block font-mono text-xl font-extrabold text-zinc-950">{{ plan.financial_projection.estimated_yield_ton_per_ha }} Ton/Ha</span>
          <span class="text-[10px] font-mono text-zinc-400">Total: {{ plan.financial_projection.total_production_kg.toLocaleString('id-ID') }} kg</span>
        </div>
        <div class="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5">
          <span class="block text-[10px] font-mono text-zinc-500 uppercase">Pendapatan Kotor</span>
          <span class="mt-1 block font-mono text-xl font-extrabold text-zinc-950">Rp {{ (plan.financial_projection.gross_revenue_idr / 1000000).toFixed(2) }} Juta</span>
          <span class="text-[10px] font-mono text-zinc-400">@ Rp {{ plan.financial_projection.market_price_per_kg.toLocaleString('id-ID') }}/kg</span>
        </div>
        <div class="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5">
          <span class="block text-[10px] font-mono text-zinc-500 uppercase">Total Biaya Modal</span>
          <span class="mt-1 block font-mono text-xl font-extrabold text-zinc-950">Rp {{ (plan.financial_projection.total_cost_idr / 1000000).toFixed(2) }} Juta</span>
          <span class="text-[10px] font-mono text-zinc-400">Benih, pupuk & tenaga</span>
        </div>
        <div class="rounded-xl border-2 border-zinc-950 bg-zinc-950 p-3.5 text-white">
          <span class="block text-[10px] font-mono text-zinc-300 uppercase">Estimasi Laba Bersih</span>
          <span class="mt-1 block font-mono text-xl font-extrabold text-white">Rp {{ (plan.financial_projection.net_profit_idr / 1000000).toFixed(2) }} Juta</span>
          <span class="text-[10px] font-mono text-zinc-300">Proyeksi ROI: <strong>{{ plan.financial_projection.roi_percentage }}%</strong></span>
        </div>
      </div>

      <!-- Cost Breakdown Table -->
      <div class="rounded-xl border border-zinc-200 p-4 font-mono text-xs space-y-2">
        <div class="flex justify-between border-b border-zinc-200 pb-2 font-bold text-zinc-950">
          <span>Rincian Biaya Operasional Lahan:</span>
          <span>Nominal (IDR)</span>
        </div>
        <div class="flex justify-between text-zinc-600">
          <span>1. Benih & Perbanyakan:</span>
          <span>Rp {{ plan.financial_projection.cost_breakdown.seeds_idr.toLocaleString('id-ID') }}</span>
        </div>
        <div class="flex justify-between text-zinc-600">
          <span>2. Pupuk (NPK, Urea, Organik) & Obat:</span>
          <span>Rp {{ plan.financial_projection.cost_breakdown.fertilizer_idr.toLocaleString('id-ID') }}</span>
        </div>
        <div class="flex justify-between text-zinc-600">
          <span>3. Tenaga Kerja (Olah Tanah, Tanam, Siang, Panen):</span>
          <span>Rp {{ plan.financial_projection.cost_breakdown.labor_idr.toLocaleString('id-ID') }}</span>
        </div>
        <div class="flex justify-between text-zinc-600">
          <span>4. Pengairan & Pompa:</span>
          <span>Rp {{ plan.financial_projection.cost_breakdown.water_pumping_idr.toLocaleString('id-ID') }}</span>
        </div>
      </div>
    </div>

    <!-- TAB 4: DOSIS PEMUPUKAN & PERINGATAN HAMA -->
    <div v-else-if="activeTab === 'fertilizer'" class="space-y-5">
      <!-- Fertilizer Schedule -->
      <div class="space-y-3">
        <h4 class="text-xs font-bold text-zinc-950 uppercase font-mono">Dosis Pemupukan Berimbang:</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div
            v-for="(fert, idx) in plan.fertilizer_schedule"
            :key="idx"
            class="rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-2"
          >
            <div class="flex items-center justify-between border-b border-zinc-200 pb-2">
              <span class="text-xs font-bold text-zinc-950">{{ fert.stage }}</span>
            </div>
            <div class="font-mono text-xs space-y-1 text-zinc-700">
              <div v-if="fert.urea_kg > 0" class="flex justify-between">
                <span>Urea:</span>
                <span class="font-bold text-zinc-950">{{ fert.urea_kg }} kg</span>
              </div>
              <div v-if="fert.npk_kg > 0" class="flex justify-between">
                <span>NPK Majemuk:</span>
                <span class="font-bold text-zinc-950">{{ fert.npk_kg }} kg</span>
              </div>
              <div v-if="fert.organic_kg > 0" class="flex justify-between">
                <span>Pupuk Organik/Kandang:</span>
                <span class="font-bold text-zinc-950">{{ fert.organic_kg }} kg</span>
              </div>
            </div>
            <p class="text-[11px] text-zinc-500 font-mono pt-1 border-t border-zinc-200">{{ fert.instructions }}</p>
          </div>
        </div>
      </div>

      <!-- Pest & Disease Alerts -->
      <div class="pt-3 border-t border-zinc-200 space-y-3">
        <h4 class="text-xs font-bold text-zinc-950 uppercase font-mono flex items-center gap-1.5">
          <AlertTriangle :size="14" class="text-zinc-900" />
          <span>Peringatan Dini Hama & Penyakit Agroklimat:</span>
        </h4>
        <div class="space-y-2">
          <div
            v-for="(pest, idx) in plan.pest_disease_alerts"
            :key="idx"
            class="rounded-xl border border-zinc-200 bg-zinc-50 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
          >
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-zinc-950">{{ pest.name }}</span>
                <span class="rounded bg-zinc-200 px-1.5 py-0.2 text-[9px] font-mono uppercase font-bold text-zinc-800">{{ pest.type }}</span>
              </div>
              <p class="text-[11px] text-zinc-500 mt-0.5">Pemicu: {{ pest.trigger_condition }}</p>
            </div>
            <div class="sm:max-w-xs font-mono text-[11px] text-zinc-700 bg-white p-2 rounded-lg border border-zinc-200">
              <span class="font-bold text-zinc-950">Mitigasi: </span>{{ pest.preventive_action }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { BookOpen, AlertTriangle } from '@lucide/vue'
import type { DetailedAgronomyPlan } from '~/types/agronomy'

defineProps<{
  plan: DetailedAgronomyPlan
}>()

const activeTab = ref<'stages' | 'water' | 'finance' | 'fertilizer'>('stages')

const tabs = [
  { id: 'stages', label: '1. Siklus Fase' },
  { id: 'water', label: '2. Neraca Air' },
  { id: 'finance', label: '3. Proyeksi Finansial' },
  { id: 'fertilizer', label: '4. Dosis Pupuk & Hama' }
]
</script>
