export default defineNuxtRouteMiddleware((to) => {
  // Only evaluate on client
  if (import.meta.server) return

  const { isAuthenticated, openAuthModal } = useAuth()

  if (!isAuthenticated.value) {
    // Open auth modal or redirect to login
    openAuthModal(to.fullPath)
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }
})
