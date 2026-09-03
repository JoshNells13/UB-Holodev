<template>
  <footer class="border-t border-zinc-200 bg-zinc-50 py-12 text-zinc-600">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 gap-8 md:grid-cols-4">
        <!-- Col 1 -->
        <div class="space-y-3 md:col-span-2">
          <div class="flex items-center gap-2 font-bold text-zinc-950">
            <div class="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-950 text-white">
              <Sprout :size="16" />
            </div>
            <span class="tracking-wider uppercase font-extrabold text-sm">TANIAMAN DSS</span>
          </div>
          <p class="max-w-md text-xs leading-relaxed text-zinc-600">
            Platform Decision Support System (DSS) berbasis iklim, kebutuhan air, dan analisis risiko ekonomi. Membantu petani, agronomis, dan peneliti membuat keputusan tanam berbasis simulasi.
          </p>
          <div class="flex items-center gap-2 pt-1 font-mono text-[11px] text-zinc-500">
            <span>Tech: Nuxt 4</span>
            <span>•</span>
            <span>PostgreSQL Supabase</span>
            <span>•</span>
            <span>Open-Meteo & NASA POWER</span>
          </div>
        </div>

        <!-- Col 2 -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-zinc-950">Fitur Utama</h4>
          <ul class="mt-3 space-y-2 text-xs">
            <li><NuxtLink to="/simulate" class="hover:text-zinc-950 transition">Simulasi What-If</NuxtLink></li>
            <li><NuxtLink to="/compare" class="hover:text-zinc-950 transition">Komparasi Skenario Multi-Variabel</NuxtLink></li>
            <li><NuxtLink to="/portfolio" class="hover:text-zinc-950 transition">Portofolio Lahan Terdiversifikasi</NuxtLink></li>
            <li><NuxtLink to="/crops" class="hover:text-zinc-950 transition">Katalog Agroklimat Tanaman</NuxtLink></li>
          </ul>
        </div>

        <!-- Col 3 -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-zinc-950">Nilai Inti DSS</h4>
          <div class="mt-3 space-y-1.5 text-xs text-zinc-600 font-mono">
            <div class="flex items-center gap-1.5">
              <ArrowRight :size="12" class="text-zinc-400" />
              <span>1. Data Agroklimat</span>
            </div>
            <div class="flex items-center gap-1.5">
              <ArrowRight :size="12" class="text-zinc-400" />
              <span>2. Risk Assessment</span>
            </div>
            <div class="flex items-center gap-1.5">
              <ArrowRight :size="12" class="text-zinc-400" />
              <span>3. What-If Simulation</span>
            </div>
            <div class="flex items-center gap-1.5">
              <ArrowRight :size="12" class="text-zinc-400" />
              <span>4. Explainable Decision</span>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 border-t border-zinc-200 pt-6 text-center text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© 2026 TANIAMAN. Climate-Agricultural Decision Support System.</p>
        <p class="font-mono text-[11px] text-zinc-400">Design Mode: High-Contrast Monochrome (Wireframe Ready)</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { Sprout, ArrowRight } from '@lucide/vue'
</script>
