<template>
  <div class="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-[#fbfaf6]">
    <!-- Left Hero Banner (Deep Forest Emerald) -->
    <div class="lg:w-5/12 bg-forest-950 p-8 sm:p-12 lg:p-16 text-white flex flex-col justify-between relative overflow-hidden">
      <!-- Ambient Glow -->
      <div class="absolute -top-24 -left-24 w-96 h-96 bg-forest-800/40 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-24 -right-24 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 space-y-8">
        <!-- Logo & Brand -->
        <div class="flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500 text-forest-950 shadow-md">
            <Sprout :size="26" />
          </div>
          <span class="text-xl font-extrabold uppercase tracking-wider text-white">SIAP TANI</span>
        </div>

        <div class="w-16 h-1 bg-gold-500 rounded-full"></div>

        <!-- Headline & Description -->
        <div class="space-y-4">
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
            Gabung bersama ribuan agronomis presisi
          </h1>
          <p class="text-xs sm:text-sm text-emerald-100/70 leading-relaxed max-w-md">
            Uji kelayakan agroklimat, hitung neraca air tanah FAO-56, dan mitigasi risiko gagal panen secara terukur.
          </p>
        </div>

        <!-- 3 Key Features -->
        <div class="space-y-3.5 pt-4 font-sans text-xs sm:text-sm text-emerald-100/90">
          <div class="flex items-center gap-3">
            <span class="h-2 w-2 rounded-full bg-gold-500 shrink-0"></span>
            <span>Simulasi What-If tanggal & komoditas tanam</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="h-2 w-2 rounded-full bg-gold-500 shrink-0"></span>
            <span>3D Digital Twin visualisasi miniatur lahan</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="h-2 w-2 rounded-full bg-gold-500 shrink-0"></span>
            <span>Jadwal preskriptif & ekspor Google Calendar</span>
          </div>
        </div>
      </div>

      <div class="relative z-10 pt-10 text-xs text-emerald-200/40 font-mono">
        © 2026 SIAP TANI DSS. Climate-Adaptive Agriculture.
      </div>
    </div>

    <!-- Right Column: Register Form -->
    <div class="lg:w-7/12 flex items-center justify-center p-6 sm:p-12 lg:p-16">
      <div class="w-full max-w-md space-y-6">
        <div>
          <span class="text-xs font-mono font-extrabold text-gold-600 uppercase tracking-widest block">
            REGISTRASI PENGGUNA
          </span>
          <h2 class="mt-1.5 text-2xl sm:text-3xl font-extrabold text-forest-950 tracking-tight">
            Daftar Akun Siap Tani
          </h2>
          <p class="mt-1.5 text-xs text-zinc-500 leading-relaxed">
            Mulai simulasi keputusan pertanian adaptif berbasis data iklim presisi.
          </p>
        </div>

        <!-- Error Alert -->
        <div v-if="errorMessage" class="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-start gap-2">
          <AlertCircle :size="15" class="mt-0.5 shrink-0" />
          <span>{{ errorMessage }}</span>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-zinc-700 mb-1.5">Nama Lengkap</label>
            <input
              v-model="fullName"
              type="text"
              required
              placeholder="Contoh: Budi Santoso"
              class="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 px-4 py-3 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:border-forest-950 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-950 transition"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-zinc-700 mb-1.5">Email</label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="nama@email.com"
              class="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 px-4 py-3 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:border-forest-950 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-950 transition"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-zinc-700 mb-1.5">Kata Sandi</label>
            <input
              v-model="password"
              type="password"
              required
              placeholder="Minimal 6 karakter"
              class="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 px-4 py-3 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:border-forest-950 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-950 transition"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full flex items-center justify-center gap-2 rounded-xl bg-gold-500 py-3.5 text-xs font-extrabold text-forest-950 transition hover:bg-gold-400 shadow-md shadow-gold-500/20 disabled:opacity-50"
          >
            <Loader2 v-if="loading" :size="16" class="animate-spin" />
            <span v-else>Daftar Sekarang</span>
          </button>
        </form>

        <!-- Divider -->
        <div class="relative my-4">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-zinc-200"></div>
          </div>
          <div class="relative flex justify-center text-xs">
            <span class="bg-[#fbfaf6] px-3 text-zinc-400 font-medium">atau</span>
          </div>
        </div>

        <!-- Quick 1-Click Demo Login Button -->
        <button
          type="button"
          @click="handleDemoLogin"
          class="w-full flex items-center justify-center gap-2 rounded-xl border border-forest-950/20 bg-forest-50 py-2.5 text-xs font-extrabold text-forest-950 hover:bg-forest-100 transition"
        >
          <Zap :size="14" class="text-gold-600" />
          <span>Masuk Cepat Mode Demo Petani (Budi Santoso)</span>
        </button>

        <p class="text-center text-xs text-zinc-500 pt-2">
          Sudah memiliki akun?
          <NuxtLink to="/login" class="font-extrabold text-gold-600 hover:text-gold-700 ml-1">
            Masuk di sini
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Sprout, AlertCircle, Loader2, Zap } from '@lucide/vue'

const { signUp, signInDemo, loading } = useAuth()
const route = useRoute()

const fullName = ref('')
const email = ref('')
const password = ref('')
const errorMessage = ref('')

const handleRegister = async () => {
  errorMessage.value = ''
  const res = await signUp(email.value, password.value, fullName.value)
  if (res.success) {
    const redirect = (route.query.redirect as string) || '/simulate'
    navigateTo(redirect)
  } else {
    errorMessage.value = res.error || 'Gagal mendaftar'
  }
}

const handleDemoLogin = () => {
  signInDemo('Budi Santoso (Petani Demo)')
  const redirect = (route.query.redirect as string) || '/simulate'
  navigateTo(redirect)
}
</script>
