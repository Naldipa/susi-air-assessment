<script setup lang="ts">
import { computed } from 'vue';
import { formatIsoDate } from '~/utils/date';

const route = useRoute();
const auth = useAuthStore();
const config = useRuntimeConfig();
const dateLabel = computed(() =>
  formatIsoDate(config.public.assessmentDate, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }),
);
const pageTitle = computed(() => {
  if (route.path === '/schedule') return 'Schedule';
  if (route.path === '/logbook') return 'Logbook';
  if (route.path === '/more') return 'More';
  return 'Dashboard';
});

async function signOut() {
  await auth.clear();
  await navigateTo('/login');
}
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar">
      <NuxtLink to="/dashboard" class="brand-lockup" aria-label="Susi Air pilot home">
        <img class="brand-logo" src="/images/susi-air-logo.png" alt="Susi Air" />
      </NuxtLink>

      <div class="sidebar-section-label">PILOT PORTAL</div>
      <AppNav class="desktop-nav" />

      <div class="sidebar-bottom">
        <p class="sidebar-context">Flight operations workspace</p>
        <button class="signout-button" type="button" @click="signOut">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M10 17l5-5-5-5M15 12H3m9-8h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>

    <div class="main-column">
      <header class="topbar">
        <div class="topbar-title">
          <span class="eyebrow">SUSI AIR / PILOT OPERATIONS</span>
          <h1>{{ pageTitle }}</h1>
        </div>

        <div class="topbar-right">
          <div class="date-chip">
            <span class="date-chip-label">As of</span>
            <strong>{{ dateLabel }}</strong>
          </div>
          <div class="user-identity">
            <span class="user-avatar">{{ auth.user?.name?.slice(0, 1) ?? 'P' }}</span>
            <span class="user-name">{{ auth.user?.name ?? 'Pilot' }}</span>
          </div>
        </div>
      </header>

      <main class="page-content">
        <slot />
      </main>
    </div>

    <div class="mobile-nav-wrap">
      <AppNav class="mobile-nav" />
    </div>
  </div>
</template>