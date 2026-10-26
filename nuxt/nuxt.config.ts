export default defineNuxtConfig({
  compatibilityDate: '2025-06-01',
  devtools: { enabled: false },
  experimental: { appManifest: false },
  modules: ['@pinia/nuxt'],
  css: ['~/assets/scss/main.scss'],
  typescript: {
    strict: true,
    typeCheck: true,
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001',
      assessmentDate:
        process.env.NUXT_PUBLIC_ASSESSMENT_DATE ??
        process.env.ASSESSMENT_TODAY ??
        '2026-05-15',
    },
  },
});