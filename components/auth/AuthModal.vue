<template>
  <div v-if="isAuthModalOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-forest-950/80 p-4 backdrop-blur-sm"
    @click.self="closeAuthModal">
    <div class="w-full max-w-md rounded-3xl border border-emerald-950/20 bg-[#FBFAF6] p-6 sm:p-8 shadow-2xl transition-all">
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-4 border-b border-zinc-200">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d49b2a] text-white shadow-xs">
            <Sprout :size="22" />
          </div>
          <div>
            <h3 class="text-base font-extrabold text-forest-950">Akses Sistem Siap Tani</h3>
            <p class="text-[11px] text-zinc-500 font-sans">Wajib masuk atau daftar sebelum melakukan simulasi</p>
          </div>
        </div>
        <button @click="closeAuthModal"
          class="rounded-xl p-1.5 text-zinc-400 hover:bg-forest-100 hover:text-forest-950 transition cursor-pointer">
          <X :size="18" />
        </button>
      </div>

      <!-- Tab Switcher -->
      <div class="mt-5 flex rounded-xl bg-forest-950/5 p-1 border border-forest-950/10">
        <button type="button" @click="mode = 'login'" class="flex-1 rounded-lg py-2 text-xs font-bold transition cursor-pointer"
          :class="mode === 'login' ? 'bg-[#0C2B1C] text-white shadow-xs' : 'text-zinc-600 hover:text-forest-950'">
          Masuk Akun
        </button>
        <button type="button" @click="mode = 'register'"
          class="flex-1 rounded-lg py-2 text-xs font-bold transition cursor-pointer"
          :class="mode === 'register' ? 'bg-[#0C2B1C] text-white shadow-xs' : 'text-zinc-600 hover:text-forest-950'">
          Daftar Baru
        </button>
      </div>

      <!-- Error alert -->
      <div v-if="errorMessage"
        class="mt-3.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-start gap-2 font-sans">
        <AlertCircle :size="15" class="mt-0.5 shrink-0" />
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="mt-5 space-y-4 font-sans">
        <div v-if="mode === 'register'">
          <label class="block text-xs font-bold text-zinc-700 mb-1">Nama Lengkap</label>
          <div class="relative">
            <User :size="15" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input v-model="fullName" type="text" required placeholder="Contoh: Budi Santoso"
              class="w-full rounded-xl border border-[#e5e5df] bg-[#f8f7f2] py-2.5 pl-10 pr-3.5 text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 focus:border-[#0C2B1C] focus:bg-white focus:outline-none shadow-xs transition-all" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-zinc-700 mb-1">Alamat Email</label>
          <div class="relative">
            <Mail :size="15" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input v-model="email" type="email" required placeholder="nama@email.com"
              class="w-full rounded-xl border border-[#e5e5df] bg-[#f8f7f2] py-2.5 pl-10 pr-3.5 text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 focus:border-[#0C2B1C] focus:bg-white focus:outline-none shadow-xs transition-all" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-zinc-700 mb-1">Kata Sandi</label>
          <div class="relative">
            <KeyRound :size="15" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input v-model="password" type="password" required placeholder="Minimal 6 karakter"
              class="w-full rounded-xl border border-[#e5e5df] bg-[#f8f7f2] py-2.5 pl-10 pr-3.5 text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 focus:border-[#0C2B1C] focus:bg-white focus:outline-none shadow-xs transition-all" />
          </div>
        </div>

        <button type="submit" :disabled="loading"
          class="w-full flex items-center justify-center gap-2 rounded-xl bg-[#d49b2a] py-3 text-xs font-extrabold text-[#111827] transition-all hover:bg-[#c28c23] shadow-xs cursor-pointer disabled:opacity-50">
          <Loader2 v-if="loading" :size="15" class="animate-spin" />
          <span v-else>{{ mode === 'login' ? 'Masuk ke Sistem' : 'Buat Akun Siap Tani' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Sprout, X, AlertCircle, Loader2, User, Mail, KeyRound } from '@lucide/vue'

const { isAuthModalOpen, closeAuthModal, redirectAfterAuth, signIn, signUp, loading } = useAuth()

const mode = ref<'login' | 'register'>('login')
const fullName = ref('')
const email = ref('')
const password = ref('')
const errorMessage = ref('')

const handleSubmit = async () => {
  errorMessage.value = ''
  if (mode.value === 'login') {
    const res = await signIn(email.value, password.value)
    if (res.success) {
      const target = redirectAfterAuth.value || '/'
      closeAuthModal()
      navigateTo(target)
    } else {
      errorMessage.value = res.error || 'Gagal masuk akun'
    }
  } else {
    const res = await signUp(email.value, password.value, fullName.value)
    if (res.success) {
      const target = redirectAfterAuth.value || '/'
      closeAuthModal()
      navigateTo(target)
    } else {
      errorMessage.value = res.error || 'Gagal mendaftar akun'
    }
  }
}
</script>
