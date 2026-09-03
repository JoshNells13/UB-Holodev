<template>
  <div class="min-h-screen flex flex-col bg-white text-zinc-950 font-sans selection:bg-zinc-950 selection:text-white">
    <AppNavbar />
    <main class="flex-1">
      <NuxtPage />
    </main>
    <AppFooter />
    <AuthModal />
  </div>
</template>

<script setup lang="ts">
import AppNavbar from '~/components/layout/AppNavbar.vue'
import AppFooter from '~/components/layout/AppFooter.vue'
import AuthModal from '~/components/auth/AuthModal.vue'
</script>
