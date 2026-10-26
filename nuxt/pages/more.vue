<script setup lang="ts">
const auth = useAuthStore();

async function signOut() {
  await auth.clear();
  await navigateTo('/login');
}
</script>

<template>
  <div class="more-page">
    <section class="welcome-row">
      <div>
        <span class="eyebrow">ACCOUNT & PREFERENCES</span>
        <h2>More</h2>
        <p class="muted-copy">Pilot profile and account access.</p>
      </div>
    </section>

    <section class="panel account-panel">
      <div class="account-heading">
        <span class="pilot-avatar account-avatar">{{ auth.user?.name?.slice(0, 1) ?? 'P' }}</span>
        <div>
          <span class="eyebrow">PILOT PROFILE</span>
          <h3>{{ auth.user?.name ?? 'Pilot' }}</h3>
          <span class="account-caption">Susi Air pilot portal</span>
        </div>
      </div>

      <div class="account-details">
        <div>
          <span class="account-detail-label">Total flight hours</span>
          <strong>{{ auth.user?.totalFlightHours?.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) ?? '—' }} hrs</strong>
        </div>
        <NuxtLink to="/dashboard" class="secondary-button">View operations dashboard</NuxtLink>
      </div>

      <div class="account-footer">
        <span class="account-caption">Manage access to this pilot workspace.</span>
        <button type="button" class="secondary-button signout-action" @click="signOut">Sign out</button>
      </div>
    </section>

    <section class="panel account-links">
      <div>
        <span class="eyebrow">FLIGHT OPERATIONS</span>
        <h3>Quick access</h3>
      </div>
      <NuxtLink to="/schedule" class="account-link">
        <span><strong>Duty schedule</strong><small>Review scheduled duties and completion status.</small></span>
        <span aria-hidden="true">→</span>
      </NuxtLink>
      <NuxtLink to="/logbook" class="account-link">
        <span><strong>Flight logbook</strong><small>Review daily recorded flight time.</small></span>
        <span aria-hidden="true">→</span>
      </NuxtLink>
    </section>
  </div>
</template>
