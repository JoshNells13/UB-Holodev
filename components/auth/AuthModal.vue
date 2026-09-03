<template>
  <div
    v-if="isAuthModalOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 p-4 backdrop-blur-sm"
    @click.self="closeAuthModal"
  >
    <div class="w-full max-w-md rounded-xl border border-zinc-300 bg-white p-6 shadow-2xl transition-all">
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-4 border-b border-zinc-200">
        <div class="flex items-center gap-2">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 text-white">
            <Lock :size="16" />
          </div>
          <div>
            <h3 class="text-base font-bold text-zinc-950">Akses Sistem TANIAMAN</h3>
            <p class="text-xs text-zinc-500">Wajib masuk atau daftar sebelum melakukan simulasi</p>
          </div>
        </div>
        <button
          @click="closeAuthModal"
          class="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition"
        >
          <X :size="18" />
        </button>
      </div>

      <!-- Tab Switcher -->
      <div class="mt-4 flex rounded-lg bg-zinc-100 p-1">
        <button
          type="button"
          @click="mode = 'login'"
          class="flex-1 rounded-md py-1.5 text-xs font-semibold transition"
          :class="mode === 'login' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-600 hover:text-zinc-950'"
        >
          Masuk Akun
        </button>
        <button
          type="button"
          @click="mode = 'register'"
          class="flex-1 rounded-md py-1.5 text-xs font-semibold transition"
          :class="mode === 'register' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-600 hover:text-zinc-950'"
        >
          Daftar Baru
        </button>
      </div>

      <!-- Error alert -->
      <div v-if="errorMessage" class="mt-3 rounded-lg border border-zinc-300 bg-zinc-50 p-2.5 text-xs text-zinc-900 flex items-start gap-2">
        <AlertCircle :size="15" class="mt-0.5 shrink-0 text-zinc-900" />
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="mt-4 space-y-3.5">
        <div v-if="mode === 'register'">
          <label class="block text-xs font-medium text-zinc-700 mb-1">Nama Lengkap</label>
          <div class="relative">
            <User :size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              v-model="fullName"
              type="text"
              required
              placeholder="Contoh: Budi Santoso"
              class="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-950"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium text-zinc-700 mb-1">Alamat Email</label>
          <div class="relative">
            <Mail :size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              v-model="email"
              type="email"
              required
              placeholder="nama@email.com"
              class="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-950"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium text-zinc-700 mb-1">Kata Sandi</label>
          <div class="relative">
            <KeyRound :size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              v-model="password"
              type="password"
              required
              placeholder="Minimal 6 karakter"
              class="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-950"
            />
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-950 py-2.5 text-xs font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50"
        >
          <Loader2 v-if="loading" :size="15" class="animate-spin" />
          <span v-else>{{ mode === 'login' ? 'Masuk ke Sistem' : 'Buat Akun TANIAMAN' }}</span>
        </button>
      </form>

      <!-- Quick Demo Access Divider -->
      <div class="relative my-4">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-zinc-200"></div>
        </div>
        <div class="relative flex justify-center text-[10px] uppercase font-mono">
          <span class="bg-white px-2 text-zinc-400">Atau Evaluasi Cepat</span>
        </div>
      </div>

      <!-- Quick Demo Login Button -->
      <button
        type="button"
        @click="handleDemoLogin"
        class="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-zinc-900 bg-zinc-50 py-2 text-xs font-bold text-zinc-950 transition hover:bg-zinc-200"
      >
        <Zap :size="15" />
        <span>Masuk Cepat Mode Demo (1-Click)</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Lock, X, AlertCircle, User, Mail, KeyRound, Loader2, Zap } from '@lucide/vue'

const { isAuthModalOpen, closeAuthModal, redirectAfterAuth, signIn, signUp, signInDemo, loading } = useAuth()

const mode = ref<'login' | 'register'>('login')
const email = ref('')
const password = ref('')
const fullName = ref('')
const errorMessage = ref('')

const handleSubmit = async () => {
  errorMessage.value = ''
  if (mode.value === 'login') {
    const res = await signIn(email.value, password.value)
    if (res.success) {
      closeAuthModal()
      navigateTo(redirectAfterAuth.value || '/simulate')
    } else {
      errorMessage.value = res.error || 'Gagal masuk akun'
    }
  } else {
    const res = await signUp(email.value, password.value, fullName.value)
    if (res.success) {
      closeAuthModal()
      navigateTo(redirectAfterAuth.value || '/simulate')
    } else {
      errorMessage.value = res.error || 'Gagal mendaftar'
    }
  }
}

const handleDemoLogin = () => {
  signInDemo('Budi Santoso (Petani Demo)')
  closeAuthModal()
  navigateTo(redirectAfterAuth.value || '/simulate')
}
</script>
