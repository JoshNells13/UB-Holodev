<template>
  <div class="rounded-2xl border border-zinc-300 bg-white p-5 shadow-clean-sm space-y-4">
    <!-- Header with GPS button -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 pb-3">
      <div class="flex items-center gap-2">
        <div class="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-950 text-white">
          <MapPin :size="16" />
        </div>
        <div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-zinc-950">Titik Koordinat & Peta Lahan</h3>
          <p class="text-[11px] text-zinc-500">Klik peta atau gunakan GPS untuk menetapkan lokasi presisi lahan</p>
        </div>
      </div>

      <!-- GPS Button -->
      <button
        type="button"
        @click="detectUserGPS"
        :disabled="isLocating"
        class="flex items-center gap-1.5 rounded-xl border border-zinc-900 bg-zinc-950 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-zinc-800 disabled:opacity-50 shadow-sm"
      >
        <Loader2 v-if="isLocating" :size="13" class="animate-spin" />
        <Navigation v-else :size="13" />
        <span>{{ isLocating ? 'Mendeteksi GPS...' : 'Gunakan Titik GPS Saya' }}</span>
      </button>
    </div>

    <!-- Interactive Leaflet Map Container -->
    <div class="relative w-full h-64 rounded-xl overflow-hidden border border-zinc-300 bg-zinc-100 z-0">
      <div id="farm-leaflet-map" class="w-full h-full grayscale contrast-105"></div>
      
      <!-- Coordinate Overlay Badge -->
      <div class="absolute bottom-2.5 left-2.5 z-[1000] rounded-lg border border-zinc-300 bg-white/95 px-3 py-1.5 backdrop-blur shadow-md font-mono text-[11px] text-zinc-900">
        <span class="text-zinc-500 font-normal">Koordinat: </span>
        <span class="font-bold">{{ lat.toFixed(5) }}°, {{ lon.toFixed(5) }}°</span>
      </div>
    </div>

    <!-- Resolved Subdistrict Location Banner -->
    <div class="rounded-xl border border-zinc-200 bg-zinc-50 p-3 flex items-center justify-between text-xs">
      <div class="flex items-center gap-2">
        <Compass :size="16" class="text-zinc-900 shrink-0" />
        <div>
          <span class="block text-[10px] uppercase font-mono text-zinc-500">Lokasi / Wilayah Terdeteksi:</span>
          <span class="font-bold text-zinc-950">{{ locationName || 'Menyesuaikan titik peta...' }}</span>
        </div>
      </div>
      <span class="font-mono text-[10px] text-zinc-500 bg-zinc-200 px-2 py-0.5 rounded border border-zinc-300">
        Ketuk Peta untuk Ubah Titik
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { MapPin, Navigation, Compass, Loader2 } from '@lucide/vue'

const props = defineProps<{
  latitude: number
  longitude: number
  name?: string
}>()

const emit = defineEmits<{
  (e: 'update:location', val: { name: string; latitude: number; longitude: number }): void
}>()

const lat = ref(props.latitude || -7.4478)
const lon = ref(props.longitude || 112.7183)
const locationName = ref(props.name || 'Sidoarjo')
const isLocating = ref(false)

let mapInstance: any = null
let markerInstance: any = null

const initMap = async () => {
  if (import.meta.server) return

  try {
    // Dynamic import Leaflet to avoid SSR issues
    const L = await import('leaflet')
    // Import leaflet css
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    const container = document.getElementById('farm-leaflet-map')
    if (!container) return

    if (mapInstance) {
      mapInstance.remove()
    }

    mapInstance = L.map('farm-leaflet-map', {
      center: [lat.value, lon.value],
      zoom: 13,
      zoomControl: true
    })

    // CartoDB Positron / OSM Monochrome Tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(mapInstance)

    // Custom Black & White Pin Icon
    const customIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="background-color: #09090b; width: 26px; height: 26px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
          <div style="width: 8px; height: 8px; background-color: #ffffff; border-radius: 50%; transform: rotate(45deg);"></div>
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 26]
    })

    markerInstance = L.marker([lat.value, lon.value], {
      icon: customIcon,
      draggable: true
    }).addTo(mapInstance)

    // Drag marker event
    markerInstance.on('dragend', async (event: any) => {
      const position = event.target.getLatLng()
      await updateCoords(position.lat, position.lng)
    })

    // Click map event
    mapInstance.on('click', async (e: any) => {
      markerInstance.setLatLng(e.latlng)
      await updateCoords(e.latlng.lat, e.latlng.lng)
    })
  } catch (err) {
    console.warn('Leaflet map init notice:', err)
  }
}

const updateCoords = async (newLat: number, newLon: number) => {
  lat.value = newLat
  lon.value = newLon

  try {
    const res: any = await $fetch(`/api/geocoding/reverse?lat=${newLat}&lon=${newLon}`)
    if (res && res.name) {
      locationName.value = res.name
    }
  } catch (e) {
    locationName.value = `Lahan (${newLat.toFixed(4)}°, ${newLon.toFixed(4)}°)`
  }

  emit('update:location', {
    name: locationName.value,
    latitude: lat.value,
    longitude: lon.value
  })
}

const detectUserGPS = () => {
  if (!navigator.geolocation) {
    alert('Browser tidak mendukung pendeteksi GPS')
    return
  }

  isLocating.value = true
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const userLat = pos.coords.latitude
      const userLon = pos.coords.longitude
      
      if (mapInstance && markerInstance) {
        mapInstance.setView([userLat, userLon], 14)
        markerInstance.setLatLng([userLat, userLon])
      }

      await updateCoords(userLat, userLon)
      isLocating.value = false
    },
    (err) => {
      console.warn('Geolocation error:', err)
      alert('Gagal mengambil titik GPS: ' + err.message)
      isLocating.value = false
    },
    { enableHighAccuracy: true, timeout: 8000 }
  )
}

watch(
  () => [props.latitude, props.longitude],
  ([newLat, newLon]) => {
    if (newLat && newLon && (newLat !== lat.value || newLon !== lon.value)) {
      lat.value = newLat
      lon.value = newLon
      locationName.value = props.name || locationName.value
      if (mapInstance && markerInstance) {
        mapInstance.setView([newLat, newLon], 13)
        markerInstance.setLatLng([newLat, newLon])
      }
    }
  }
)

onMounted(() => {
  setTimeout(() => {
    initMap()
  }, 200)
})
</script>
