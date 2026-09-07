<template>
  <div>
    <label class="block text-xs font-bold uppercase tracking-wider text-forest-950 mb-1.5 flex items-center justify-between">
      <span class="flex items-center gap-1.5">
        <Sprout :size="15" class="text-gold-600" />
        <span>2. Komoditas Tanaman</span>
      </span>
      <span v-if="selectedCrop" class="text-[10px] font-mono text-zinc-500 font-bold">
        {{ selectedCrop.growth_days_min }}–{{ selectedCrop.growth_days_max }} Hari
      </span>
    </label>

    <!-- Trigger button showing selected crop -->
    <div
      @click="isOpen = true"
      class="group flex cursor-pointer items-center justify-between rounded-xl border border-emerald-950/15 bg-white p-3 transition-all hover:border-forest-900 shadow-sm"
    >
      <div v-if="selectedCrop" class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-950/10 bg-forest-900 text-gold-400 font-bold shadow-xs">
          <Sprout :size="20" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h4 class="text-xs font-bold text-forest-950">{{ selectedCrop.name }}</h4>
            <span class="rounded bg-forest-100 px-2 py-0.5 text-[9px] font-mono font-bold uppercase text-forest-900 border border-forest-200">
              {{ selectedCrop.category }}
            </span>
          </div>
          <p class="text-[11px] text-zinc-500 line-clamp-1 font-sans mt-0.5">
            Air: {{ selectedCrop.water_requirement }} ({{ selectedCrop.water_requirement_mm }}mm) • Suhu: {{ selectedCrop.optimal_temp_min }}–{{ selectedCrop.optimal_temp_max }}°C
          </p>
        </div>
      </div>
      <div v-else class="text-xs text-zinc-400">Pilih komoditas...</div>

      <ChevronRight :size="16" class="text-zinc-400 group-hover:text-forest-950 transition" />
    </div>

    <!-- Modal Grid Selection -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-forest-950/70 p-4 backdrop-blur-sm"
      @click.self="isOpen = false"
    >
      <div class="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl border border-emerald-950/20 bg-white shadow-2xl overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-200 bg-forest-950 text-white">
          <div class="flex items-center gap-3">
            <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-500 text-forest-950 font-bold shadow-sm">
              <Sprout :size="18" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-white">Pilih Komoditas Pertanian</h3>
              <p class="text-xs text-emerald-200/80 font-sans">Database spesifikasi agroklimat dan kebutuhan air</p>
            </div>
          </div>
          <button @click="isOpen = false" class="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white cursor-pointer">
            <X :size="18" />
          </button>
        </div>

        <!-- Crop List Cards -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-[#fbfaf6]">
          <div
            v-for="crop in crops"
            :key="crop.slug"
            @click="selectCrop(crop)"
            class="group cursor-pointer rounded-2xl border p-4 transition-all text-left flex flex-col justify-between"
            :class="selectedCrop?.slug === crop.slug ? 'border-forest-900 bg-forest-900 text-white ring-2 ring-gold-400 shadow-premium' : 'border-emerald-950/10 bg-white hover:border-forest-900/40 hover:shadow-md text-zinc-900'"
          >
            <div>
              <div class="flex items-center justify-between">
                <span
                  class="rounded-md px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider"
                  :class="selectedCrop?.slug === crop.slug ? 'bg-white/15 text-gold-300 border border-white/20' : 'bg-forest-100 text-forest-900 border border-forest-200'"
                >
                  {{ crop.category }}
                </span>
                <Check v-if="selectedCrop?.slug === crop.slug" :size="16" class="text-gold-400 font-bold" />
              </div>
              <h4 class="mt-2.5 text-xs font-bold leading-tight" :class="selectedCrop?.slug === crop.slug ? 'text-white' : 'text-forest-950'">
                {{ crop.name }}
              </h4>
              <p class="mt-1 text-[11px] leading-relaxed line-clamp-2 font-sans" :class="selectedCrop?.slug === crop.slug ? 'text-emerald-100/80' : 'text-zinc-600'">
                {{ crop.description }}
              </p>
            </div>

            <!-- Agronomic specs -->
            <div
              class="mt-3.5 pt-2.5 border-t grid grid-cols-3 gap-1 font-mono text-[10px]"
              :class="selectedCrop?.slug === crop.slug ? 'border-white/15 text-emerald-200' : 'border-zinc-200 text-zinc-600'"
            >
              <div>
                <span class="block text-[9px] uppercase text-zinc-400 font-bold">Durasi</span>
                <span class="font-bold" :class="selectedCrop?.slug === crop.slug ? 'text-white' : 'text-forest-950'">{{ crop.growth_days_min }}–{{ crop.growth_days_max }} h</span>
              </div>
              <div>
                <span class="block text-[9px] uppercase text-zinc-400 font-bold">Air</span>
                <span class="font-bold" :class="selectedCrop?.slug === crop.slug ? 'text-white' : 'text-forest-950'">{{ crop.water_requirement_mm }} mm</span>
              </div>
              <div>
                <span class="block text-[9px] uppercase text-zinc-400 font-bold">Harga Acuan</span>
                <span class="font-bold" :class="selectedCrop?.slug === crop.slug ? 'text-gold-400' : 'text-forest-950'">Rp {{ (crop.market_price_baseline / 1000).toFixed(1) }}k</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Sprout, ChevronRight, X, Check } from '@lucide/vue'
import type { Crop } from '~/types/crop'

const props = defineProps<{
  modelValue?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', slug: string): void
  (e: 'change', crop: Crop): void
}>()

const { fetchCrops, cropsList } = useSimulation()
const isOpen = ref(false)
const crops = ref<Crop[]>([])
const selectedCrop = ref<Crop | null>(null)

const selectCrop = (crop: Crop) => {
  selectedCrop.value = crop
  isOpen.value = false
  emit('update:modelValue', crop.slug)
  emit('change', crop)
}

onMounted(async () => {
  crops.value = await fetchCrops()
  const initial = crops.value.find(c => c.slug === (props.modelValue || 'padi')) || crops.value[0]
  if (initial) {
    selectedCrop.value = initial
  }
})
</script>
