<template>
  <header class="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur">
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <!-- Logo & Brand -->
      <div class="flex items-center gap-8">
        <NuxtLink to="/" class="flex items-center gap-2.5 font-bold tracking-tight text-zinc-950 transition hover:opacity-80">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-950 text-white shadow-sm">
            <Sprout :size="20" :stroke-width="2.2" />
          </div>
          <div class="flex flex-col">
            <span class="text-lg font-extrabold uppercase leading-none tracking-wider">TANIAMAN</span>
            <span class="text-[10px] font-medium tracking-widest text-zinc-500 uppercase">Decision Support System</span>
          </div>
        </NuxtLink>

        <!-- Navigation Links -->
        <nav class="hidden md:flex items-center gap-1">
          <NuxtLink
            to="/"
            class="rounded-md px-3 py-1.5 text-sm font-medium transition"
            :class="$route.path === '/' ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'"
          >
            Beranda
          </NuxtLink>
          <button
            @click="handleNavTo('/simulate')"
            class="rounded-md px-3 py-1.5 text-sm font-medium transition"
            :class="$route.path === '/simulate' ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'"
          >
            Simulasi What-If
          </button>
          <button
            @click="handleNavTo('/compare')"
            class="rounded-md px-3 py-1.5 text-sm font-medium transition flex items-center gap-1.5"
            :class="$route.path === '/compare' ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'"
          >
            <span>Komparasi Skenario</span>
            <span v-if="comparisonList.length > 0" class="flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-950 px-1 text-[10px] font-bold text-white">
              {{ comparisonList.length }}
            </span>
          </button>
          <button
            @click="handleNavTo('/portfolio')"
            class="rounded-md px-3 py-1.5 text-sm font-medium transition"
            :class="$route.path === '/portfolio' ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'"
          >
            Portofolio Lahan
          </button>
          <button
            @click="handleNavTo('/calendar')"
            class="rounded-md px-3 py-1.5 text-sm font-medium transition flex items-center gap-1.5"
            :class="$route.path === '/calendar' ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'"
          >
            <Calendar :size="14" />
            <span>Kalender Tanam</span>
          </button>
          <NuxtLink
            to="/crops"
            class="rounded-md px-3 py-1.5 text-sm font-medium transition"
            :class="$route.path === '/crops' ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'"
          >
            Database Tanaman
          </NuxtLink>
        </nav>
      </div>

      <!-- Auth Controls & Actions -->
      <div class="flex items-center gap-3">
        <ClientOnly>
          <template v-if="isAuthenticated && user">
            <NuxtLink
              to="/history"
              class="hidden sm:flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-800 transition hover:bg-zinc-100"
            >
              <History :size="14" />
              <span>Riwayat</span>
            </NuxtLink>

            <!-- User Menu Dropdown -->
            <div class="relative group">
              <button class="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-800 transition hover:border-zinc-400">
                <div class="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white">
                  {{ user.full_name?.charAt(0) || 'P' }}
                </div>
                <span class="max-w-[120px] truncate font-semibold">{{ user.full_name }}</span>
                <span v-if="isDemoUser" class="rounded bg-zinc-200 px-1 py-0.2 text-[9px] font-mono uppercase text-zinc-700">Demo</span>
                <ChevronDown :size="13" class="text-zinc-500" />
              </button>

              <div class="absolute right-0 top-full mt-1 hidden w-48 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-lg group-hover:block z-50">
                <div class="px-2.5 py-1.5 border-b border-zinc-100">
                  <p class="text-xs font-semibold text-zinc-900">{{ user.full_name }}</p>
                  <p class="text-[11px] text-zinc-500 truncate">{{ user.email }}</p>
                </div>
                <NuxtLink to="/history" class="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100">
                  <History :size="14" />
                  <span>Riwayat Simulasi</span>
                </NuxtLink>
                <button @click="signOut" class="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-red-600 hover:bg-zinc-100">
                  <LogOut :size="14" />
                  <span>Keluar Akun</span>
                </button>
              </div>
            </div>
          </template>

          <template v-else>
            <button
              @click="openAuthModal('/simulate')"
              class="rounded-lg border border-zinc-300 px-3.5 py-1.5 text-xs font-semibold text-zinc-900 transition hover:bg-zinc-100"
            >
              Masuk
            </button>
            <button
              @click="openAuthModal('/simulate')"
              class="flex items-center gap-1.5 rounded-lg bg-zinc-950 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-zinc-800 shadow-sm"
            >
              <UserPlus :size="14" />
              <span>Daftar</span>
            </button>
          </template>

          <template #fallback>
            <button
              @click="openAuthModal('/simulate')"
              class="rounded-lg border border-zinc-300 px-3.5 py-1.5 text-xs font-semibold text-zinc-900"
            >
              Masuk
            </button>
          </template>
        </ClientOnly>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Sprout, History, ChevronDown, LogOut, UserPlus, Calendar } from '@lucide/vue'

const { user, isAuthenticated, isDemoUser, signOut, openAuthModal } = useAuth()
const { comparisonList } = useSimulation()

const handleNavTo = (path: string) => {
  if (!isAuthenticated.value) {
    openAuthModal(path)
  } else {
    navigateTo(path)
  }
}
</script>
