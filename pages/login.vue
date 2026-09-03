<template>
  <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-zinc-50 px-4 py-12">
    <div class="w-full max-w-md rounded-2xl border border-zinc-300 bg-white p-8 shadow-clean-lg">
      <div class="text-center">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-950 text-white">
          <Sprout :size="24" />
        </div>
        <h1 class="mt-4 text-xl font-extrabold text-zinc-950 uppercase tracking-tight">Masuk ke TANIAMAN</h1>
        <p class="mt-1 text-xs text-zinc-500">Akses Decision Support System & Eksekusi Simulasi Keputusan Pertanian</p>
      </div>

      <!-- Error Alert -->
      <div v-if="errorMessage" class="mt-5 rounded-lg border border-zinc-300 bg-zinc-100 p-3 text-xs text-zinc-900 flex items-start gap-2">
        <AlertCircle :size="16" class="mt-0.5 shrink-0" />
        <span>{{ errorMessage }}</span>
      </div>

      <form @submit.prevent="handleLogin" class="mt-6 space-y-4">
        <div>
          <label class="block text-xs font-semibold text-zinc-700 mb-1">Email</label>
          <div class="relative">
            <Mail :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              v-model="email"
              type="email"
              required
              placeholder="nama@email.com"
              class="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-10 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-950"
            />
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="text-xs font-semibold text-zinc-700">Kata Sandi</label>
          </div>
          <div class="relative">
            <KeyRound :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              v-model="password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-10 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-950"
            />
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-950 py-2.5 text-xs font-bold text-white transition hover:bg-zinc-800 disabled:opacity-50"
        >
          <Loader2 v-if="loading" :size="16" class="animate-spin" />
          <span v-else>Masuk ke Akun</span>
        </button>
      </form>

      <!-- Demo Login Option -->
      <div class="mt-6 pt-5 border-t border-zinc-200">
        <button
          type="button"
          @click="handleDemoLogin"
          class="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-zinc-900 bg-zinc-100 py-2 text-xs font-bold text-zinc-950 transition hover:bg-zinc-200"
        >
          <Zap :size="15" />
          <span>Masuk Cepat Mode Demo Petani (1-Click)</span>
        </button>
      </div>

      <p class="mt-6 text-center text-xs text-zinc-500">
        Belum memiliki akun?
        <NuxtLink to="/register" class="font-bold text-zinc-950 underline underline-offset-4 hover:text-zinc-700">
          Daftar Sekarang
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Sprout, Mail, KeyRound, AlertCircle, Loader2, Zap } from '@lucide/vue'

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
