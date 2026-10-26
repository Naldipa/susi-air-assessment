<script setup lang="ts">
import { formatIsoDate } from '~/utils/date';
import { computed, onMounted, ref, watch } from 'vue';
import type { DocumentsResponse, FlightHoursSummary, LimitsResponse } from '~/types/api';

const api = useApi();
const config = useRuntimeConfig();
const assessmentLabel = computed(() =>
  formatIsoDate(config.public.assessmentDate, { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }),
);
const auth = useAuthStore();
const ranges = [
  { value: '1w', label: '1W' },
  { value: '1m', label: '1M' },
  { value: '3m', label: '3M' },
  { value: '6m', label: '6M' },
  { value: '1y', label: '1Y' },
] as const;

const selectedRange = ref<(typeof ranges)[number]['value']>('1w');
const limits = ref<LimitsResponse | null>(null);
const documents = ref<DocumentsResponse | null>(null);
const summary = ref<FlightHoursSummary | null>(null);
const loading = ref(true);
const summaryLoading = ref(false);
const pageError = ref('');
const summaryError = ref('');

function getErrorMessage(error: unknown): string {
  const result = error as { data?: { message?: string | string[] } };
  const message = result.data?.message;
  return Array.isArray(message) ? message.join('. ') : message ?? 'Unable to load data.';
}

async function loadDashboard() {
  loading.value = true;
  pageError.value = '';
  const results = await Promise.allSettled([
    api.request<LimitsResponse>('/flight-hours/limits'),
    api.request<DocumentsResponse>('/documents'),
  ]);
  if (results[0].status === 'fulfilled') limits.value = results[0].value;
  else pageError.value = getErrorMessage(results[0].reason);
  if (results[1].status === 'fulfilled') documents.value = results[1].value;
  else pageError.value = pageError.value || getErrorMessage(results[1].reason);
  loading.value = false;
  await loadSummary(selectedRange.value);
}

async function loadSummary(range: string) {
  summaryLoading.value = true;
  summaryError.value = '';
  try {
    summary.value = await api.request<FlightHoursSummary>(
      '/flight-hours/summary?range=' + encodeURIComponent(range),
    );
  } catch (error) {
    summaryError.value = getErrorMessage(error);
  } finally {
    summaryLoading.value = false;
  }
}

onMounted(() => void loadDashboard());
watch(selectedRange, (next, previous) => {
  if (next !== previous) void loadSummary(next);
});
</script>

<template>
  <div class="dashboard-page">
    <section class="welcome-row">
      <div>
        <span class="eyebrow">{{ assessmentLabel }}</span>
        <h2>Flight operations</h2>
        <p class="muted-copy">Flight activity, regulatory limits and document status.</p>
      </div>
      <NuxtLink to="/schedule" class="secondary-button">View schedule <span aria-hidden="true">&rarr;</span></NuxtLink>
    </section>

    <section class="pilot-summary-card">
      <div class="pilot-identity">
        <div class="pilot-avatar large-avatar">{{ auth.user?.name?.slice(0, 1) ?? 'P' }}</div>
        <div><span class="eyebrow">PILOT PROFILE</span><h3>{{ auth.user?.name ?? 'Pilot' }}</h3><span class="profile-caption">Pilot record</span></div>
      </div>
      <div class="profile-divider"></div>
      <div class="total-hours">
        <span class="eyebrow">TOTAL FLIGHT HOURS</span>
        <strong>{{ auth.user?.totalFlightHours?.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) ?? '—' }}<small> hrs</small></strong>
        <span class="profile-caption">Pilot record</span>
      </div>
      
    </section>

    <section class="section-block">
      <div class="section-heading">
        <div><span class="eyebrow">COMPLIANCE MONITOR</span><h3>Hours to limit</h3></div>
        <span v-if="limits" class="as-of-label">As of {{ limits.referenceDate }}</span>
      </div>
      <div v-if="loading && !limits" class="limit-grid"><div v-for="index in 4" :key="index" class="loading-card"></div></div>
      <div v-else-if="limits" class="limit-grid"><LimitCard v-for="card in limits.cards" :key="card.key" :card="card" /></div>
      <div v-else class="inline-error" role="alert">{{ pageError || 'Limit information is unavailable.' }} <button type="button" @click="loadDashboard">Retry</button></div>
    </section>

    <div class="dashboard-grid">
      <section class="panel chart-panel">
        <div class="section-heading chart-heading">
          <div><span class="eyebrow">FLIGHT ACTIVITY</span><h3>Rolling flight hours</h3></div>
          <div class="range-switch" role="group" aria-label="Chart range">
            <button v-for="range in ranges" :key="range.value" type="button" :class="{ selected: selectedRange === range.value }" :aria-pressed="selectedRange === range.value" @click="selectedRange = range.value">{{ range.label }}</button>
          </div>
        </div>
        <div class="chart-summary"><strong>{{ summary?.limit ?? '—' }}<small>h</small></strong><span>limit over selected rolling period</span></div>
        <div v-if="summaryLoading && !summary" class="chart-placeholder" role="status">Loading flight data…</div>
        <div v-else-if="summaryError && !summary" class="chart-placeholder chart-error" role="alert">{{ summaryError }} <button type="button" @click="loadSummary(selectedRange)">Retry</button></div>
        <FlightHoursChart v-else-if="summary" :points="summary.points" :limit="summary.limit" :chart-max="summary.chartMax" />
        <p class="chart-note">Review daily flight time within your selected rolling period.</p>
      </section>

      <section class="panel documents-panel">
        <div class="section-heading">
          <div><span class="eyebrow">FLIGHT READINESS</span><h3>My documents</h3></div>
          <span v-if="documents" class="document-count">{{ documents.documents.length }} items</span>
        </div>
        <p v-if="documents" class="panel-description">Expiration status uses a {{ documents.warningDays }}-day warning window.</p>
        <div v-if="loading && !documents" class="document-loading" role="status">Loading documents…</div>
        <div v-else-if="documents" class="document-list">
          <DocumentCard v-for="document in documents.documents" :key="document.id" :document="document" />
        </div>
        <div v-else class="inline-error" role="alert">{{ pageError || 'Document information is unavailable.' }} <button type="button" @click="loadDashboard">Retry</button></div>
        <div v-if="documents" class="document-legend">
          <span><i class="legend-safe"></i> Valid</span><span><i class="legend-warning"></i> Due soon</span><span><i class="legend-danger"></i> Expired</span>
        </div>
      </section>
    </div>
  </div>
</template>
