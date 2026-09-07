<template>
  <header class="sticky top-0 z-40 w-full border-b border-forest-950/10 bg-white/95 backdrop-blur-md shadow-xs">
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <!-- Logo & Brand -->
      <div class="flex items-center gap-8">
        <NuxtLink to="/" class="flex items-center gap-2.5 font-bold tracking-tight text-forest-950 transition hover:opacity-85">
          <img src="/icon_logo.png" alt="Siap Tani Logo" class="h-9 w-9 object-contain shrink-0 drop-shadow-xs" />
          <div class="flex flex-col">
            <span class="text-base sm:text-lg font-extrabold uppercase leading-none tracking-wider text-forest-950">SIAP TANI</span>
            <span class="text-[9px] sm:text-[10px] font-semibold tracking-widest text-forest-700/80 uppercase">Decision Support System</span>
          </div>
        </NuxtLink>

        <!-- Desktop Navigation Links -->
        <nav class="hidden lg:flex items-center gap-1.5">
          <NuxtLink
            to="/"
            class="rounded-lg px-3.5 py-1.5 text-xs font-semibold transition"
            :class="$route.path === '/' ? 'bg-forest-950 text-white shadow-xs' : 'text-zinc-700 hover:text-forest-950 hover:bg-forest-50'"
          >
            Beranda
          </NuxtLink>
          <button
            @click="handleNavTo('/simulate')"
            class="rounded-lg px-3.5 py-1.5 text-xs font-semibold transition"
            :class="$route.path === '/simulate' ? 'bg-forest-950 text-white shadow-xs' : 'text-zinc-700 hover:text-forest-950 hover:bg-forest-50'"
          >
            Simulasi What-If
          </button>
          <button
            @click="handleNavTo('/compare')"
            class="rounded-lg px-3.5 py-1.5 text-xs font-semibold transition flex items-center gap-1.5"
            :class="$route.path === '/compare' ? 'bg-forest-950 text-white shadow-xs' : 'text-zinc-700 hover:text-forest-950 hover:bg-forest-50'"
          >
            <span>Komparasi Skenario</span>
            <span v-if="comparisonList.length > 0" class="flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[9px] font-extrabold text-forest-950">
              {{ comparisonList.length }}
            </span>
          </button>
          <button
            @click="handleNavTo('/portfolio')"
            class="rounded-lg px-3.5 py-1.5 text-xs font-semibold transition"
            :class="$route.path === '/portfolio' ? 'bg-forest-950 text-white shadow-xs' : 'text-zinc-700 hover:text-forest-950 hover:bg-forest-50'"
          >
            Portofolio Lahan
          </button>
          <button
            @click="handleNavTo('/calendar')"
            class="rounded-lg px-3.5 py-1.5 text-xs font-semibold transition flex items-center gap-1.5"
            :class="$route.path === '/calendar' ? 'bg-forest-950 text-white shadow-xs' : 'text-zinc-700 hover:text-forest-950 hover:bg-forest-50'"
          >
            <Calendar :size="13" />
            <span>Kalender Tanam</span>
          </button>
          <NuxtLink
            to="/crops"
            class="rounded-lg px-3.5 py-1.5 text-xs font-semibold transition"
            :class="$route.path === '/crops' ? 'bg-forest-950 text-white shadow-xs' : 'text-zinc-700 hover:text-forest-950 hover:bg-forest-50'"
          >
            Database Tanaman
          </NuxtLink>
        </nav>
      </div>

      <!-- Auth Controls & Mobile Hamburger -->
      <div class="flex items-center gap-2.5">
        <ClientOnly>
          <template v-if="isAuthenticated && user">
            <NuxtLink
              to="/history"
              class="hidden sm:flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-800 transition hover:bg-forest-50 hover:border-forest-300 shadow-xs"
            >
              <RotateCcw :size="13" class="text-forest-800" />
              <span>Riwayat</span>
            </NuxtLink>

            <!-- User Menu Dropdown -->
            <div class="relative group">
              <button class="flex items-center gap-2 rounded-xl border border-forest-950/15 bg-forest-50/60 px-3 py-1.5 text-xs font-medium text-forest-950 transition hover:border-forest-900 shadow-xs">
                <div class="flex h-5 w-5 items-center justify-center rounded-full bg-forest-950 text-[10px] font-extrabold text-gold-300 ring-1 ring-gold-500/50">
                  {{ user.full_name?.charAt(0).toLowerCase() || 'b' }}
                </div>
                <span class="max-w-[100px] sm:max-w-[130px] truncate font-bold text-xs">{{ user.full_name || 'budi' }}</span>
                <span v-if="isDemoUser" class="hidden sm:inline-block rounded bg-gold-100 text-gold-800 px-1 py-0.2 text-[8px] font-mono font-bold uppercase">Demo</span>
                <ChevronDown :size="12" class="text-forest-700 transition-transform group-hover:rotate-180" />
              </button>

              <div class="absolute right-0 top-full mt-1.5 hidden w-52 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-premium group-hover:block z-50">
                <div class="px-3 py-2 border-b border-zinc-100 bg-forest-50/40 rounded-lg mb-1">
                  <p class="text-xs font-bold text-forest-950">{{ user.full_name }}</p>
                  <p class="text-[11px] text-zinc-500 truncate font-mono">{{ user.email }}</p>
                </div>
                <NuxtLink to="/history" class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-forest-50 hover:text-forest-950 transition">
                  <RotateCcw :size="14" class="text-forest-700" />
                  <span>Riwayat Simulasi</span>
                </NuxtLink>
                <button @click="signOut" class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition">
                  <LogOut :size="14" />
                  <span>Keluar Akun</span>
                </button>
              </div>
            </div>
          </template>

          <template v-else>
            <button
              @click="openAuthModal('/simulate')"
              class="rounded-xl border border-zinc-300 px-4 py-1.5 text-xs font-bold text-zinc-900 transition hover:bg-zinc-100 shadow-xs"
            >
              Masuk
            </button>
            <button
              @click="openAuthModal('/simulate')"
              class="flex items-center gap-1.5 rounded-xl bg-forest-950 px-4 py-1.5 text-xs font-extrabold text-white transition hover:bg-forest-900 shadow-xs ring-1 ring-forest-900"
            >
              <UserPlus :size="13" />
              <span>+ Daftar</span>
            </button>
          </template>

          <template #fallback>
            <button
              @click="openAuthModal('/simulate')"
              class="rounded-xl border border-zinc-300 px-4 py-1.5 text-xs font-bold text-zinc-900"
            >
              Masuk
            </button>
          </template>
        </ClientOnly>

        <!-- Mobile Menu Toggle Button -->
        <button
          type="button"
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800 hover:bg-forest-50 hover:text-forest-950 transition"
          aria-label="Toggle Mobile Menu"
        >
          <X v-if="mobileMenuOpen" :size="18" />
          <Menu v-else :size="18" />
        </button>
      </div>
    </div>

    <!-- Mobile Drawer / Dropdown -->
    <div
      v-if="mobileMenuOpen"
      class="lg:hidden border-t border-zinc-200 bg-white px-4 py-5 space-y-3 shadow-lg transition-all animate-fadeIn"
    >
      <nav class="flex flex-col space-y-1">
        <NuxtLink
          to="/"
          @click="mobileMenuOpen = false"
          class="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-bold transition"
          :class="$route.path === '/' ? 'bg-forest-950 text-white' : 'text-zinc-700 hover:bg-forest-50 hover:text-forest-950'"
        >
          <span>Beranda</span>
        </NuxtLink>
        <button
          @click="handleNavToMobile('/simulate')"
          class="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold text-left transition"
          :class="$route.path === '/simulate' ? 'bg-forest-950 text-white' : 'text-zinc-700 hover:bg-forest-50 hover:text-forest-950'"
        >
          <span>Simulasi What-If</span>
          <span class="text-[10px] font-mono font-normal opacity-70">DSS Studio</span>
        </button>
        <button
          @click="handleNavToMobile('/compare')"
          class="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold text-left transition"
          :class="$route.path === '/compare' ? 'bg-forest-950 text-white' : 'text-zinc-700 hover:bg-forest-50 hover:text-forest-950'"
        >
          <span>Komparasi Skenario</span>
          <span v-if="comparisonList.length > 0" class="flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1.5 text-[9px] font-bold text-forest-950">
            {{ comparisonList.length }}
          </span>
        </button>
        <button
          @click="handleNavToMobile('/portfolio')"
          class="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-bold text-left transition"
          :class="$route.path === '/portfolio' ? 'bg-forest-950 text-white' : 'text-zinc-700 hover:bg-forest-50 hover:text-forest-950'"
        >
          <span>Portofolio Lahan</span>
        </button>
        <button
          @click="handleNavToMobile('/calendar')"
          class="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold text-left transition"
          :class="$route.path === '/calendar' ? 'bg-forest-950 text-white' : 'text-zinc-700 hover:bg-forest-50 hover:text-forest-950'"
        >
          <Calendar :size="14" />
          <span>Kalender Tanam</span>
        </button>
        <NuxtLink
          to="/crops"
          @click="mobileMenuOpen = false"
          class="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-bold transition"
          :class="$route.path === '/crops' ? 'bg-forest-950 text-white' : 'text-zinc-700 hover:bg-forest-50 hover:text-forest-950'"
        >
          <span>Database Tanaman</span>
        </NuxtLink>
        <NuxtLink
          v-if="isAuthenticated"
          to="/history"
          @click="mobileMenuOpen = false"
          class="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition text-zinc-700 hover:bg-forest-50 hover:text-forest-950"
        >
          <RotateCcw :size="14" />
          <span>Riwayat Simulasi</span>
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RotateCcw, ChevronDown, LogOut, UserPlus, Calendar, Menu, X } from '@lucide/vue'

const { user, isAuthenticated, isDemoUser, signOut, openAuthModal } = useAuth()
const { comparisonList } = useSimulation()

const mobileMenuOpen = ref(false)

const handleNavTo = (path: string) => {
  if (!isAuthenticated.value) {
    openAuthModal(path)
  } else {
    navigateTo(path)
  }
}

const handleNavToMobile = (path: string) => {
  mobileMenuOpen.value = false
  handleNavTo(path)
}
</script>
