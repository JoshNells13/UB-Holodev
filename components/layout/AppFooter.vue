<template>
  <footer class="border-t border-forest-900 bg-forest-950 text-emerald-100/80 py-14">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 gap-10 md:grid-cols-4">
        <!-- Col 1: Brand & Mission -->
        <div class="space-y-3.5 md:col-span-2">
          <div class="flex items-center gap-2.5 font-bold text-white">
            <img src="/icon_logo.png" alt="Siap Tani Logo" class="h-9 w-9 object-contain shrink-0" />
            <span class="tracking-wider uppercase font-extrabold text-base text-gold-400">SIAP TANI DSS</span>
          </div>
          <p class="max-w-md text-xs leading-relaxed text-emerald-100/70">
            Platform Decision Support System (DSS) berbasis iklim, kebutuhan air, dan analisis risiko ekonomi. Membantu petani, agronomis, dan peneliti membuat keputusan tanam berbasis simulasi.
          </p>
          <div class="flex flex-wrap items-center gap-2 pt-2 font-mono text-[11px] text-emerald-300/70">
            <span>Tech: Nuxt 4</span>
            <span>•</span>
            <span>PostgreSQL Supabase</span>
            <span>•</span>
            <span>Open-Meteo & NASA POWER</span>
          </div>
        </div>

        <!-- Col 2: Fitur Utama -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-gold-400">Fitur Utama</h4>
          <ul class="mt-3.5 space-y-2.5 text-xs text-emerald-100/80">
            <li><NuxtLink to="/simulate" class="hover:text-gold-300 transition flex items-center gap-1.5">Simulasi What-If</NuxtLink></li>
            <li><NuxtLink to="/compare" class="hover:text-gold-300 transition flex items-center gap-1.5">Komparasi Skenario Multi-Variabel</NuxtLink></li>
            <li><NuxtLink to="/portfolio" class="hover:text-gold-300 transition flex items-center gap-1.5">Portofolio Lahan Terdiversifikasi</NuxtLink></li>
            <li><NuxtLink to="/crops" class="hover:text-gold-300 transition flex items-center gap-1.5">Katalog Agroklimat Tanaman</NuxtLink></li>
          </ul>
        </div>

        <!-- Col 3: Nilai Inti DSS -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-gold-400">Nilai Inti DSS</h4>
          <div class="mt-3.5 space-y-2 text-xs text-emerald-100/80 font-mono">
            <div class="flex items-center gap-2">
              <ArrowRight :size="12" class="text-gold-400 shrink-0" />
              <span>1. Data Agroklimat</span>
            </div>
            <div class="flex items-center gap-2">
              <ArrowRight :size="12" class="text-gold-400 shrink-0" />
              <span>2. Risk Assessment</span>
            </div>
            <div class="flex items-center gap-2">
              <ArrowRight :size="12" class="text-gold-400 shrink-0" />
              <span>3. What-If Simulation</span>
            </div>
            <div class="flex items-center gap-2">
              <ArrowRight :size="12" class="text-gold-400 shrink-0" />
              <span>4. Explainable Decision</span>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-12 border-t border-forest-900 pt-6 text-center text-xs text-emerald-200/60 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>© 2026 SIAP TANI. Climate-Agricultural Decision Support System.</p>
        <p class="font-mono text-[11px] text-gold-400/90 font-semibold">Design Mode: Premium Emerald & Gold</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'
</script>
