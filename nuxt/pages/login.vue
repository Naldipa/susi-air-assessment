<script setup lang="ts">
import { ref } from 'vue';

definePageMeta({ layout: false });

const auth = useAuthStore();
const username = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');

function errorText(error: unknown): string {
  const result = error as { data?: { message?: string | string[] } };
  const message = result.data?.message;
  return Array.isArray(message)
    ? message.join('. ')
    : message ?? 'Sign in failed. Check your credentials and try again.';
}

async function submit() {
  if (loading.value) return;
  errorMessage.value = '';
  loading.value = true;
  try {
    await auth.login(username.value.trim(), password.value);
    await navigateTo('/dashboard');
  } catch (error) {
    errorMessage.value = errorText(error);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main class="login-page">
    <section class="login-brand-panel">
      <NuxtLink to="/login" class="login-brand-lockup" aria-label="Susi Air">
        <img src="/images/susi-air-logo.png" alt="Susi Air" />
      </NuxtLink>

      <div class="login-brand-copy">
        <span class="eyebrow">FLIGHT OPERATIONS</span>
        <h1>Pilot operations</h1>
        <p>Flight hours, duty schedules and document status in one workspace.</p>
      </div>

      <ul class="login-feature-list" aria-label="Portal features">
        <li><span>01</span> Flight hour limits</li>
        <li><span>02</span> Monthly duty schedule</li>
        <li><span>03</span> Pilot document status</li>
      </ul>

      <p class="login-brand-footer">PT. ASI Pudjiastuti Aviation <span>Indonesia</span></p>
    </section>

    <section class="login-form-panel">
      <div class="login-form-wrap">
        <span class="eyebrow">STAFF ACCESS</span>
        <h2>Sign in</h2>
        <p class="muted-copy">Use your assigned account to continue.</p>

        <form class="login-form" @submit.prevent="submit">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="username"
            name="username"
            type="text"
            autocomplete="username"
            placeholder="Enter your username"
            required
            maxlength="100"
          />

          <div class="password-label-row">
            <label for="password">Password</label>
            <span class="secure-label">SECURE ACCESS</span>
          </div>
          <input
            id="password"
            v-model="password"
            name="password"
            type="password"
            autocomplete="current-password"
            placeholder="Enter your password"
            required
            maxlength="200"
          />

          <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>
          <button class="primary-button login-submit" type="submit" :disabled="loading">
            <span>{{ loading ? 'Signing in...' : 'Sign in' }}</span>
            <span aria-hidden="true">&rarr;</span>
          </button>
        </form>
      </div>
    </section>
  </main>
</template>
