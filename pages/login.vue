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
            Kelola pertanian Anda dengan lebih mudah
          </h1>
          <p class="text-xs sm:text-sm text-emerald-100/70 leading-relaxed max-w-md">
            Platform digital premium untuk membantu petani mengelola lahan, hasil panen, dan penjualan dalam satu tempat.
          </p>
        </div>

        <!-- 3 Key Features -->
        <div class="space-y-3.5 pt-4 font-sans text-xs sm:text-sm text-emerald-100/90">
          <div class="flex items-center gap-3">
            <span class="h-2 w-2 rounded-full bg-gold-500 shrink-0"></span>
            <span>Pantau kondisi lahan secara real-time</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="h-2 w-2 rounded-full bg-gold-500 shrink-0"></span>
            <span>Catat hasil panen dengan mudah</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="h-2 w-2 rounded-full bg-gold-500 shrink-0"></span>
            <span>Jual hasil tani langsung ke pembeli</span>
          </div>
        </div>
      </div>

      <div class="relative z-10 pt-10 text-xs text-emerald-200/40 font-mono">
        © 2026 SIAP TANI DSS. Climate-Adaptive Agriculture.
      </div>
    </div>

    <!-- Right Column: Login Form -->
    <div class="lg:w-7/12 flex items-center justify-center p-6 sm:p-12 lg:p-16">
      <div class="w-full max-w-md space-y-6">
        <div>
          <span class="text-xs font-mono font-extrabold text-gold-600 uppercase tracking-widest block">
            SELAMAT DATANG
          </span>
          <h2 class="mt-1.5 text-2xl sm:text-3xl font-extrabold text-forest-950 tracking-tight">
            Masuk ke Akun Anda
          </h2>
          <p class="mt-1.5 text-xs text-zinc-500 leading-relaxed">
            Silakan masukkan email dan kata sandi Anda untuk melanjutkan ke Decision Support System.
          </p>
        </div>

        <!-- Error Alert -->
        <div v-if="errorMessage" class="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-start gap-2">
          <AlertCircle :size="15" class="mt-0.5 shrink-0" />
          <span>{{ errorMessage }}</span>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
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
              placeholder="••••••••"
              class="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 px-4 py-3 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:border-forest-950 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-950 transition"
            />
          </div>

          <div class="flex items-center justify-between text-xs pt-1">
            <label class="flex items-center gap-2 cursor-pointer text-zinc-600">
              <input type="checkbox" class="rounded border-zinc-300 accent-forest-950 text-forest-950 focus:ring-forest-950" />
              <span>Ingat saya</span>
            </label>
            <a href="#" class="font-bold text-gold-600 hover:text-gold-700">Lupa kata sandi?</a>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full flex items-center justify-center gap-2 rounded-xl bg-gold-500 py-3.5 text-xs font-extrabold text-forest-950 transition hover:bg-gold-400 shadow-md shadow-gold-500/20 disabled:opacity-50"
          >
            <Loader2 v-if="loading" :size="16" class="animate-spin" />
            <span v-else>Masuk</span>
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

        <!-- Google Login Button -->
        <button
          type="button"
          @click="handleDemoLogin"
          class="w-full flex items-center justify-center gap-2.5 rounded-xl border border-zinc-300 bg-white py-3 text-xs font-bold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-400 transition shadow-xs"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Masuk dengan Google</span>
        </button>

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
          Belum punya akun?
          <NuxtLink to="/register" class="font-extrabold text-gold-600 hover:text-gold-700 ml-1">
            Daftar
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Sprout, AlertCircle, Loader2, Zap } from '@lucide/vue'

const { signIn, signInDemo, loading } = useAuth()
const route = useRoute()

const email = ref('')
const password = ref('')
const errorMessage = ref('')

const handleLogin = async () => {
  errorMessage.value = ''
  const res = await signIn(email.value, password.value)
  if (res.success) {
    const redirect = (route.query.redirect as string) || '/simulate'
    navigateTo(redirect)
  } else {
    errorMessage.value = res.error || 'Gagal masuk akun'
  }
}

const handleDemoLogin = () => {
  signInDemo('Budi Santoso (Petani Demo)')
  const redirect = (route.query.redirect as string) || '/simulate'
  navigateTo(redirect)
}
</script>
