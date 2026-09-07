<template>
  <header class="sticky top-0 z-40 w-full border-b border-forest-950/10 bg-white/95 backdrop-blur-md shadow-2xs">
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <!-- Logo & Brand -->
      <div class="flex items-center gap-8">
        <NuxtLink to="/" class="flex items-center gap-2.5 font-bold tracking-tight text-forest-950 transition hover:opacity-85">
          <img src="/icon_logo.png" alt="Siap Tani Logo" class="h-9 w-9 object-contain shrink-0 drop-shadow-xs" />
        </NuxtLink>

        <!-- Desktop Navigation Links -->
        <nav class="hidden lg:flex items-center gap-1">
          <NuxtLink
            to="/"
            class="rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all"
            :class="$route.path === '/' ? 'bg-[#0C2B1C] text-gold-300 shadow-xs' : 'text-zinc-700 hover:text-forest-950 hover:bg-forest-950/5'"
          >
            Beranda
          </NuxtLink>
          <button
            @click="handleNavTo('/simulate')"
            class="rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer"
            :class="$route.path === '/simulate' ? 'bg-[#0C2B1C] text-gold-300 shadow-xs' : 'text-zinc-700 hover:text-forest-950 hover:bg-forest-950/5'"
          >
            Simulasi What-If
          </button>
          <button
            @click="handleNavTo('/compare')"
            class="rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            :class="$route.path === '/compare' ? 'bg-[#0C2B1C] text-gold-300 shadow-xs' : 'text-zinc-700 hover:text-forest-950 hover:bg-forest-950/5'"
          >
            <span>Komparasi Skenario</span>
            <span v-if="comparisonList.length > 0" class="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d49b2a] px-1 text-[9px] font-extrabold text-[#0C2B1C]">
              {{ comparisonList.length }}
            </span>
          </button>
          <button
            @click="handleNavTo('/portfolio')"
            class="rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer"
            :class="$route.path === '/portfolio' ? 'bg-[#0C2B1C] text-gold-300 shadow-xs' : 'text-zinc-700 hover:text-forest-950 hover:bg-forest-950/5'"
          >
            Portofolio Lahan
          </button>
          <button
            @click="handleNavTo('/calendar')"
            class="rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            :class="$route.path === '/calendar' ? 'bg-[#0C2B1C] text-gold-300 shadow-xs' : 'text-zinc-700 hover:text-forest-950 hover:bg-forest-950/5'"
          >
            <Calendar :size="13" />
            <span>Kalender Tanam</span>
          </button>
          <NuxtLink
            to="/crops"
            class="rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all"
            :class="$route.path === '/crops' ? 'bg-[#0C2B1C] text-gold-300 shadow-xs' : 'text-zinc-700 hover:text-forest-950 hover:bg-forest-950/5'"
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
              class="hidden sm:flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-bold text-zinc-800 transition hover:bg-forest-50 hover:border-forest-300 shadow-2xs"
            >
              <RotateCcw :size="13" class="text-forest-800" />
              <span>Riwayat</span>
            </NuxtLink>

            <!-- User Menu Dropdown -->
            <div ref="profileMenuRef" class="relative">
              <button
                type="button"
                @click="isProfileMenuOpen = !isProfileMenuOpen"
                class="flex items-center gap-2 rounded-xl border border-forest-950/15 bg-forest-50/70 px-3 py-1.5 text-xs font-bold text-forest-950 transition hover:border-forest-900 shadow-2xs cursor-pointer"
                :class="{ 'border-forest-900 bg-forest-100/80': isProfileMenuOpen }"
                aria-haspopup="true"
                :aria-expanded="isProfileMenuOpen"
              >
                <div class="flex h-6 w-6 items-center justify-center rounded-full bg-[#0C2B1C] text-[10px] font-extrabold text-gold-300 ring-1 ring-gold-500/50">
                  {{ user.full_name?.charAt(0).toUpperCase() || 'P' }}
                </div>
                <span class="max-w-[100px] sm:max-w-[130px] truncate font-bold text-xs">{{ user.full_name || 'Petani' }}</span>
                <span v-if="isDemoUser" class="hidden sm:inline-block rounded bg-gold-100 text-gold-900 px-1.5 py-0.2 text-[8px] font-mono font-bold uppercase border border-gold-300">Demo</span>
                <ChevronDown :size="12" class="text-forest-700 transition-transform duration-200" :class="{ 'rotate-180': isProfileMenuOpen }" />
              </button>

              <div
                v-if="isProfileMenuOpen"
                class="absolute right-0 top-full mt-1.5 w-52 rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-premium z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <div class="px-3 py-2 border-b border-zinc-100 bg-forest-50/40 rounded-xl mb-1">
                  <p class="text-xs font-bold text-forest-950 truncate">{{ user.full_name }}</p>
                  <p class="text-[10px] text-zinc-500 truncate font-mono">{{ user.email }}</p>
                </div>
                <NuxtLink
                  to="/history"
                  @click="isProfileMenuOpen = false"
                  class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-zinc-700 hover:bg-forest-50 hover:text-forest-950 transition"
                >
                  <RotateCcw :size="14" class="text-forest-700" />
                  <span>Riwayat Simulasi</span>
                </NuxtLink>
                <button
                  type="button"
                  @click="handleSignOut"
                  class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition cursor-pointer"
                >
                  <LogOut :size="14" />
                  <span>Keluar Akun</span>
                </button>
              </div>
            </div>
          </template>

          <template v-else>
            <NuxtLink
              to="/login"
              class="rounded-xl border border-zinc-300 px-4 py-1.5 text-xs font-bold text-zinc-900 transition hover:bg-zinc-100 shadow-2xs"
            >
              Masuk
            </NuxtLink>
            <NuxtLink
              to="/register"
              class="flex items-center gap-1.5 rounded-xl bg-[#0C2B1C] px-4 py-1.5 text-xs font-extrabold text-gold-300 transition hover:bg-forest-900 shadow-2xs ring-1 ring-[#0C2B1C]"
            >
              <UserPlus :size="13" />
              <span>Daftar</span>
            </NuxtLink>
          </template>

          <template #fallback>
            <NuxtLink
              to="/login"
              class="rounded-xl border border-zinc-300 px-4 py-1.5 text-xs font-bold text-zinc-900"
            >
              Masuk
            </NuxtLink>
          </template>
        </ClientOnly>

        <!-- Mobile Menu Toggle Button -->
        <button
          type="button"
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800 hover:bg-forest-50 hover:text-forest-950 transition cursor-pointer"
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
      class="lg:hidden border-t border-zinc-200 bg-[#FBFAF6] px-4 py-5 space-y-2 shadow-lg transition-all"
    >
      <nav class="flex flex-col space-y-1">
        <NuxtLink
          to="/"
          @click="mobileMenuOpen = false"
          class="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-bold transition"
          :class="$route.path === '/' ? 'bg-[#0C2B1C] text-gold-300' : 'text-zinc-700 hover:bg-forest-50 hover:text-forest-950'"
        >
          <span>Beranda</span>
        </NuxtLink>
        <button
          @click="handleNavToMobile('/simulate')"
          class="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold text-left transition cursor-pointer"
          :class="$route.path === '/simulate' ? 'bg-[#0C2B1C] text-gold-300' : 'text-zinc-700 hover:bg-forest-50 hover:text-forest-950'"
        >
          <span>Simulasi What-If</span>
          <span class="text-[10px] font-mono font-normal opacity-70">DSS Studio</span>
        </button>
        <button
          @click="handleNavToMobile('/compare')"
          class="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold text-left transition cursor-pointer"
          :class="$route.path === '/compare' ? 'bg-[#0C2B1C] text-gold-300' : 'text-zinc-700 hover:bg-forest-50 hover:text-forest-950'"
        >
          <span>Komparasi Skenario</span>
          <span v-if="comparisonList.length > 0" class="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d49b2a] px-1.5 text-[9px] font-bold text-[#0C2B1C]">
            {{ comparisonList.length }}
          </span>
        </button>
        <button
          @click="handleNavToMobile('/portfolio')"
          class="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-bold text-left transition cursor-pointer"
          :class="$route.path === '/portfolio' ? 'bg-[#0C2B1C] text-gold-300' : 'text-zinc-700 hover:bg-forest-50 hover:text-forest-950'"
        >
          <span>Portofolio Lahan</span>
        </button>
        <button
          @click="handleNavToMobile('/calendar')"
          class="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold text-left transition cursor-pointer"
          :class="$route.path === '/calendar' ? 'bg-[#0C2B1C] text-gold-300' : 'text-zinc-700 hover:bg-forest-50 hover:text-forest-950'"
        >
          <Calendar :size="14" />
          <span>Kalender Tanam</span>
        </button>
        <NuxtLink
          to="/crops"
          @click="mobileMenuOpen = false"
          class="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-bold transition"
          :class="$route.path === '/crops' ? 'bg-[#0C2B1C] text-gold-300' : 'text-zinc-700 hover:bg-forest-50 hover:text-forest-950'"
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
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { RotateCcw, ChevronDown, LogOut, UserPlus, Calendar, Menu, X } from '@lucide/vue'

const { user, isAuthenticated, isDemoUser, signOut, openAuthModal } = useAuth()
const { comparisonList } = useSimulation()
const route = useRoute()

const mobileMenuOpen = ref(false)
const isProfileMenuOpen = ref(false)
const profileMenuRef = ref<HTMLElement | null>(null)

const handleClickOutside = (event: MouseEvent) => {
  if (profileMenuRef.value && !profileMenuRef.value.contains(event.target as Node)) {
    isProfileMenuOpen.value = false
  }
}

const handleSignOut = async () => {
  isProfileMenuOpen.value = false
  await signOut()
}

// Close dropdown on route change
watch(() => route.path, () => {
  isProfileMenuOpen.value = false
  mobileMenuOpen.value = false
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

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

