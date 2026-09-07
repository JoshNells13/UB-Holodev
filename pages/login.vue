<template>
  <div class="min-h-screen w-full flex flex-col lg:flex-row bg-[#FBFAF6]">
    <!-- Left Hero Banner (Deep Dark Forest Green #0C2B1C) -->
    <div class="w-full lg:w-1/2 min-h-screen bg-[#0C2B1C] p-8 sm:p-14 lg:p-20 text-white flex flex-col justify-between relative overflow-hidden">
      <!-- Ambient Glows -->
      <div class="absolute -top-32 -left-32 w-96 h-96 bg-[#16432f]/40 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-32 -right-32 w-96 h-96 bg-[#d49b2a]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 space-y-8 my-auto">
        <!-- Brand / Logo -->
        <div class="flex items-center gap-3.5">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-[#d49b2a] text-white shadow-md">
            <Sprout :size="26" />
          </div>
          <span class="text-xl font-extrabold uppercase tracking-wider text-white">SIAP TANI</span>
        </div>

        <!-- Gold Horizontal Accent Line -->
        <div class="w-14 h-1 bg-[#d49b2a] rounded-full"></div>

        <!-- Big Headline & Subtitle -->
        <div class="space-y-4">
          <h1 class="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-white leading-[1.2] tracking-tight">
            Kelola pertanian Anda dengan lebih mudah
          </h1>
          <p class="text-sm sm:text-base text-[#a7beb2] leading-relaxed max-w-md font-sans">
            Platform digital premium untuk membantu petani mengelola lahan, hasil panen, dan penjualan dalam satu tempat.
          </p>
        </div>

        <!-- 3 Bullet Points with Gold Rounded Vertical Pills -->
        <div class="space-y-4 pt-4 font-sans text-sm sm:text-base text-[#e5ede8]">
          <div class="flex items-center gap-3.5">
            <span class="w-1.5 h-3.5 rounded-full bg-[#d49b2a] shrink-0"></span>
            <span>Pantau kondisi lahan secara real-time</span>
          </div>
          <div class="flex items-center gap-3.5">
            <span class="w-1.5 h-3.5 rounded-full bg-[#d49b2a] shrink-0"></span>
            <span>Catat hasil panen dengan mudah</span>
          </div>
          <div class="flex items-center gap-3.5">
            <span class="w-1.5 h-3.5 rounded-full bg-[#d49b2a] shrink-0"></span>
            <span>Jual hasil tani langsung ke pembeli</span>
          </div>
        </div>
      </div>

      <!-- Footer back link -->
      <div class="relative z-10 pt-10 flex items-center justify-between text-xs text-emerald-200/50 font-sans">
        <NuxtLink to="/" class="inline-flex items-center gap-1.5 text-emerald-200/70 hover:text-white transition">
          <span>← Kembali ke Beranda</span>
        </NuxtLink>
        <span>© 2026 SIAP TANI DSS</span>
      </div>
    </div>

    <!-- Right Column: Login Form Container (Cream Canvas #FBFAF6) -->
    <div class="w-full lg:w-1/2 min-h-screen bg-[#FBFAF6] flex items-center justify-center p-6 sm:p-12 lg:p-20">
      <div class="w-full max-w-[420px] space-y-6">
        <div>
          <span class="text-xs font-bold text-[#d49b2a] uppercase tracking-[0.2em] block font-sans">
            SELAMAT DATANG
          </span>
          <h2 class="mt-2 text-3xl sm:text-[34px] font-extrabold text-[#111827] tracking-tight leading-tight">
            Masuk ke Akun Anda
          </h2>
          <p class="mt-2 text-sm text-[#6b7280] leading-relaxed font-sans">
            Silakan masukkan email dan kata sandi Anda untuk melanjutkan.
          </p>
        </div>

        <!-- Error Alert -->
        <div v-if="errorMessage" class="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-start gap-2 font-sans">
          <AlertCircle :size="16" class="mt-0.5 shrink-0" />
          <span>{{ errorMessage }}</span>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-[#1f2937] mb-2 font-sans">Email</label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="nama@email.com"
              class="w-full rounded-xl border border-[#e5e5df] bg-[#f8f7f2] px-4 py-3.5 text-sm font-medium text-[#111827] placeholder:text-[#9ca3af] focus:border-[#0C2B1C] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0C2B1C] transition-all font-sans"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-[#1f2937] mb-2 font-sans">Kata Sandi</label>
            <input
              v-model="password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full rounded-xl border border-[#e5e5df] bg-[#f8f7f2] px-4 py-3.5 text-sm font-medium text-[#111827] placeholder:text-[#9ca3af] focus:border-[#0C2B1C] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0C2B1C] transition-all font-sans"
            />
          </div>

          <div class="flex items-center justify-between text-xs pt-1 font-sans">
            <label class="flex items-center gap-2 cursor-pointer text-[#4b5563]">
              <input type="checkbox" class="w-4 h-4 rounded border-[#d1d5db] text-[#0C2B1C] focus:ring-[#0C2B1C]" />
              <span>Ingat saya</span>
            </label>
            <a href="#" class="font-bold text-[#d49b2a] hover:text-[#b8821e] transition">Lupa kata sandi?</a>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full flex items-center justify-center gap-2 rounded-xl bg-[#d49b2a] py-3.5 text-sm font-bold text-[#111827] transition-all hover:bg-[#c28c23] shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Loader2 v-if="loading" :size="16" class="animate-spin" />
            <span v-else>Masuk</span>
          </button>
        </form>

        <!-- Divider -->
        <div class="relative my-5">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-[#e5e5df]"></div>
          </div>
          <div class="relative flex justify-center text-xs">
            <span class="bg-[#FBFAF6] px-3 text-[#9ca3af] font-medium font-sans">atau</span>
          </div>
        </div>

        <!-- Google Login Button -->
        <button
          type="button"
          @click="handleDemoLogin"
          class="w-full flex items-center justify-center gap-3 rounded-xl border border-[#e5e5df] bg-white py-3 text-sm font-semibold text-[#1f2937] hover:bg-[#f3f2eb] transition-all shadow-2xs cursor-pointer font-sans"
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
          class="w-full flex items-center justify-center gap-2 rounded-xl border border-forest-900/15 bg-emerald-50/70 py-2.5 text-xs font-bold text-forest-950 hover:bg-emerald-100/70 transition-all cursor-pointer font-sans"
        >
          <Zap :size="14" class="text-[#d49b2a]" />
          <span>Masuk Cepat Mode Demo Petani (Budi Santoso)</span>
        </button>

        <p class="text-center text-xs text-[#6b7280] pt-2 font-sans">
          Belum punya akun?
          <NuxtLink to="/register" class="font-extrabold text-[#d49b2a] hover:text-[#b8821e] ml-1 transition">
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

