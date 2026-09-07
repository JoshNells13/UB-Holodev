<template>
  <div class="min-h-screen w-full flex flex-col lg:flex-row bg-[#FBFAF6]">
    <!-- Left Hero Banner (Deep Dark Forest Green #0C2B1C) - Hidden on mobile so form shows directly -->
    <div class="hidden lg:flex lg:w-1/2 min-h-screen bg-[#0C2B1C] p-8 sm:p-14 lg:p-20 text-white flex-col justify-between relative overflow-hidden">
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
            Gabung bersama ribuan agronomis presisi
          </h1>
          <p class="text-sm sm:text-base text-[#a7beb2] leading-relaxed max-w-md font-sans">
            Uji kelayakan agroklimat, hitung neraca air tanah FAO-56, dan mitigasi risiko gagal panen secara terukur.
          </p>
        </div>

        <!-- 3 Bullet Points with Gold Rounded Vertical Pills -->
        <div class="space-y-4 pt-4 font-sans text-sm sm:text-base text-[#e5ede8]">
          <div class="flex items-center gap-3.5">
            <span class="w-1.5 h-3.5 rounded-full bg-[#d49b2a] shrink-0"></span>
            <span>Simulasi What-If tanggal & komoditas tanam</span>
          </div>
          <div class="flex items-center gap-3.5">
            <span class="w-1.5 h-3.5 rounded-full bg-[#d49b2a] shrink-0"></span>
            <span>3D Digital Twin visualisasi miniatur lahan</span>
          </div>
          <div class="flex items-center gap-3.5">
            <span class="w-1.5 h-3.5 rounded-full bg-[#d49b2a] shrink-0"></span>
            <span>Jadwal preskriptif & ekspor Google Calendar</span>
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

    <!-- Right Column: Register Form Container (Cream Canvas #FBFAF6) -->
    <div class="w-full lg:w-1/2 min-h-screen bg-[#FBFAF6] flex items-center justify-center p-6 sm:p-12 lg:p-20">
      <div class="w-full max-w-[420px] space-y-6">
        <!-- Mobile Brand Header -->
        <div class="lg:hidden flex items-center justify-between border-b border-[#e5e5df] pb-4">
          <NuxtLink to="/" class="flex items-center gap-2">
            <img src="/icon_logo.png" alt="Siap Tani" class="h-8 w-8 object-contain" />
            <span class="text-base font-extrabold uppercase tracking-tight">
              <span class="text-[#0C2B1C]">Siap</span><span class="text-[#D49B2A] ml-1">Tani</span>
            </span>
          </NuxtLink>
          <NuxtLink to="/" class="text-xs text-[#6b7280] hover:text-[#0C2B1C] transition">
            Beranda
          </NuxtLink>
        </div>

        <div>
          <span class="text-xs font-bold text-[#d49b2a] uppercase tracking-[0.2em] block font-sans">
            REGISTRASI PENGGUNA
          </span>
          <h2 class="mt-2 text-2xl sm:text-[34px] font-extrabold text-[#111827] tracking-tight leading-tight">
            Daftar Akun Baru
          </h2>
          <p class="mt-2 text-sm text-[#6b7280] leading-relaxed font-sans">
            Mulai simulasi keputusan pertanian adaptif berbasis data iklim presisi.
          </p>
        </div>

        <!-- Error Alert -->
        <div v-if="errorMessage" class="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-start gap-2 font-sans">
          <AlertCircle :size="16" class="mt-0.5 shrink-0" />
          <span>{{ errorMessage }}</span>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-[#1f2937] mb-2 font-sans">Nama Lengkap</label>
            <input
              v-model="fullName"
              type="text"
              required
              placeholder="Contoh: Budi Santoso"
              class="w-full rounded-xl border border-[#e5e5df] bg-[#f8f7f2] px-4 py-3.5 text-sm font-medium text-[#111827] placeholder:text-[#9ca3af] focus:border-[#0C2B1C] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0C2B1C] transition-all font-sans"
            />
          </div>

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
              placeholder="Minimal 6 karakter"
              class="w-full rounded-xl border border-[#e5e5df] bg-[#f8f7f2] px-4 py-3.5 text-sm font-medium text-[#111827] placeholder:text-[#9ca3af] focus:border-[#0C2B1C] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0C2B1C] transition-all font-sans"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full flex items-center justify-center gap-2 rounded-xl bg-[#d49b2a] py-3.5 text-sm font-bold text-[#111827] transition-all hover:bg-[#c28c23] shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Loader2 v-if="loading" :size="16" class="animate-spin" />
            <span v-else>Daftar Sekarang</span>
          </button>
        </form>

        <p class="text-center text-xs text-[#6b7280] pt-4 font-sans">
          Sudah memiliki akun?
          <NuxtLink to="/login" class="font-extrabold text-[#d49b2a] hover:text-[#b8821e] ml-1 transition">
            Masuk di sini
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Sprout, AlertCircle, Loader2 } from '@lucide/vue'

const { signUp, loading } = useAuth()
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
</script>
