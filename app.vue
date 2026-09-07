<template>
  <div class="min-h-screen flex flex-col bg-[#fbfaf6] text-zinc-950 font-sans selection:bg-forest-900 selection:text-gold-300">
    <AppNavbar v-if="!isAuthPage" />
    <main class="flex-1 flex flex-col">
      <NuxtPage />
    </main>
    <AppFooter v-if="!isAuthPage" />
    <AuthModal />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppNavbar from '~/components/layout/AppNavbar.vue'
import AppFooter from '~/components/layout/AppFooter.vue'
import AuthModal from '~/components/auth/AuthModal.vue'

const route = useRoute()
const isAuthPage = computed(() => {
  return route.path === '/login' || route.path === '/register'
})
</script>

