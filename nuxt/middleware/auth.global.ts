export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore();

  if (to.path === '/login') {
    if (auth.token) {
      try {
        if (!auth.user) await auth.loadProfile();
        return navigateTo('/dashboard');
      } catch {
        await auth.clear();
      }
    }
    return;
  }

  if (!auth.token) return navigateTo('/login');
  if (!auth.user) {
    try {
      await auth.loadProfile();
    } catch {
      await auth.clear();
      return navigateTo('/login');
    }
  }
});
