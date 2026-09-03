<template>
  <div>
    <label class="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5 flex items-center justify-between">
      <span class="flex items-center gap-1.5">
        <Sprout :size="14" class="text-zinc-900" />
        <span>2. Komoditas Tanaman</span>
      </span>
      <span v-if="selectedCrop" class="text-[10px] font-mono text-zinc-500">
        {{ selectedCrop.growth_days_min }}–{{ selectedCrop.growth_days_max }} Hari
      </span>
    </label>

    <!-- Trigger button showing selected crop -->
    <div
      @click="isOpen = true"
      class="group flex cursor-pointer items-center justify-between rounded-xl border border-zinc-300 bg-white p-3 transition hover:border-zinc-950 shadow-sm"
    >
      <div v-if="selectedCrop" class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-300 bg-zinc-100 text-zinc-950 font-bold group-hover:bg-zinc-950 group-hover:text-white transition">
          <Sprout :size="20" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h4 class="text-xs font-bold text-zinc-950">{{ selectedCrop.name }}</h4>
            <span class="rounded bg-zinc-100 px-1.5 py-0.5 text-[9px] font-mono font-semibold uppercase text-zinc-700 border border-zinc-200">
              {{ selectedCrop.category }}
            </span>
          </div>
          <p class="text-[11px] text-zinc-500 line-clamp-1">
            Air: {{ selectedCrop.water_requirement }} ({{ selectedCrop.water_requirement_mm }}mm) • Suhu: {{ selectedCrop.optimal_temp_min }}–{{ selectedCrop.optimal_temp_max }}°C
          </p>
        </div>
      </div>
      <div v-else class="text-xs text-zinc-400">Pilih komoditas...</div>

      <ChevronRight :size="16" class="text-zinc-400 group-hover:text-zinc-950 transition" />
    </div>

    <!-- Modal Grid Selection -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 p-4 backdrop-blur-sm"
      @click.self="isOpen = false"
    >
      <div class="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-zinc-300 bg-white shadow-2xl overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-200">
          <div class="flex items-center gap-2">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 text-white">
              <Sprout :size="18" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-zinc-950">Pilih Komoditas Pertanian</h3>
              <p class="text-xs text-zinc-500">Database spesifikasi agroklimat dan kebutuhan air</p>
            </div>
          </div>
          <button @click="isOpen = false" class="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700">
            <X :size="18" />
          </button>
        </div>

        <!-- Crop List Cards -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="crop in crops"
            :key="crop.slug"
            @click="selectCrop(crop)"
            class="group cursor-pointer rounded-xl border p-3.5 transition text-left flex flex-col justify-between"
            :class="selectedCrop?.slug === crop.slug ? 'border-zinc-950 bg-zinc-950 text-white ring-1 ring-zinc-950' : 'border-zinc-200 bg-zinc-50 hover:border-zinc-400 hover:bg-white text-zinc-900'"
          >
            <div>
              <div class="flex items-center justify-between">
                <span
                  class="rounded px-1.5 py-0.5 text-[9px] font-mono font-semibold uppercase"
                  :class="selectedCrop?.slug === crop.slug ? 'bg-zinc-800 text-zinc-300 border border-zinc-700' : 'bg-zinc-200 text-zinc-700 border border-zinc-300'"
                >
                  {{ crop.category }}
                </span>
                <Check v-if="selectedCrop?.slug === crop.slug" :size="16" class="text-white" />
              </div>
              <h4 class="mt-2 text-xs font-bold leading-tight" :class="selectedCrop?.slug === crop.slug ? 'text-white' : 'text-zinc-950'">
                {{ crop.name }}
              </h4>
              <p class="mt-1 text-[11px] leading-relaxed line-clamp-2" :class="selectedCrop?.slug === crop.slug ? 'text-zinc-300' : 'text-zinc-500'">
                {{ crop.description }}
              </p>
            </div>

            <!-- Agronomic specs -->
            <div
              class="mt-3 pt-2.5 border-t grid grid-cols-3 gap-1 font-mono text-[10px]"
              :class="selectedCrop?.slug === crop.slug ? 'border-zinc-800 text-zinc-300' : 'border-zinc-200 text-zinc-600'"
            >
              <div>
                <span class="block text-[9px] uppercase text-zinc-400">Durasi</span>
                <span class="font-bold">{{ crop.growth_days_min }}–{{ crop.growth_days_max }} h</span>
              </div>
              <div>
                <span class="block text-[9px] uppercase text-zinc-400">Air</span>
                <span class="font-bold">{{ crop.water_requirement_mm }} mm</span>
              </div>
              <div>
                <span class="block text-[9px] uppercase text-zinc-400">Harga Acuan</span>
                <span class="font-bold">Rp {{ (crop.market_price_baseline / 1000).toFixed(1) }}k</span>
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
