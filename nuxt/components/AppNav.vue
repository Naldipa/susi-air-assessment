<script setup lang="ts">
const links = [
  { to: '/dashboard', label: 'Home', icon: 'home' },
  { to: '/schedule', label: 'Schedule', icon: 'calendar' },
  { to: '/logbook', label: 'Logbook', icon: 'logbook' },
  { to: '/more', label: 'More', icon: 'more' },
] as const;
</script>

<template>
  <nav class="app-nav" aria-label="Main navigation">
    <NuxtLink
      v-for="link in links"
      :key="link.to"
      :to="link.to"
      class="nav-link"
      active-class="is-active"
    >
      <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
        <template v-if="link.icon === 'home'">
          <path d="M3.5 10.5 12 3.75l8.5 6.75" />
          <path d="M5.5 9.5v10h13v-10M9.5 19.5v-6h5v6" />
        </template>
        <template v-else-if="link.icon === 'calendar'">
          <rect x="3.5" y="5" width="17" height="16" rx="2" />
          <path d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" />
        </template>
        <template v-else-if="link.icon === 'logbook'">
          <path d="M6 3.5h8l4 4v13H6a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z" />
          <path d="M14 3.5v4h4M8 12h7M8 16h7" />
        </template>
        <template v-else>
          <circle cx="5" cy="12" r="1" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
        </template>
      </svg>
      <span>{{ link.label }}</span>
    </NuxtLink>
  </nav>
</template>