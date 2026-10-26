<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import type { FlightHoursRecordsResponse } from '~/types/api';
import { formatIsoDate } from '~/utils/date';

const api = useApi();
const config = useRuntimeConfig();
const referenceDate = String(config.public.assessmentDate);
const periods = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
] as const;
const selectedDays = ref<(typeof periods)[number]['days']>(30);
const response = ref<FlightHoursRecordsResponse | null>(null);
const loading = ref(false);
const errorMessage = ref('');
let requestSequence = 0;

function addDays(date: string, offset: number): string {
  const [year, month, day] = date.split('-').map(Number);
  const value = new Date(Date.UTC(year, month - 1, day + offset));
  return [
    value.getUTCFullYear(),
    String(value.getUTCMonth() + 1).padStart(2, '0'),
    String(value.getUTCDate()).padStart(2, '0'),
  ].join('-');
}

const startDate = computed(() => addDays(referenceDate, 1 - selectedDays.value));
const visibleRecords = computed(() => [...(response.value?.records ?? [])].reverse());
const recordedDays = computed(
  () => response.value?.records.filter((record) => record.hours > 0).length ?? 0,
);
const periodLabel = computed(
  () => formatIsoDate(startDate.value, { day: 'numeric', month: 'short', year: 'numeric' })
    + ' – '
    + formatIsoDate(referenceDate, { day: 'numeric', month: 'short', year: 'numeric' }),
);

function getErrorMessage(error: unknown): string {
  const result = error as { data?: { message?: string | string[] } };
  const message = result.data?.message;
  return Array.isArray(message) ? message.join('. ') : message ?? 'Unable to load flight records.';
}

async function loadRecords(): Promise<void> {
  const currentRequest = ++requestSequence;
  loading.value = true;
  errorMessage.value = '';
  try {
    const result = await api.request<FlightHoursRecordsResponse>(
      '/flight-hours?from=' + startDate.value + '&to=' + referenceDate,
    );
    if (currentRequest === requestSequence) response.value = result;
  } catch (error) {
    if (currentRequest === requestSequence) errorMessage.value = getErrorMessage(error);
  } finally {
    if (currentRequest === requestSequence) loading.value = false;
  }
}

onMounted(() => void loadRecords());
watch(selectedDays, () => void loadRecords());
</script>

<template>
  <div class="logbook-page">
    <section class="welcome-row logbook-welcome">
      <div>
        <span class="eyebrow">FLIGHT RECORDS</span>
        <h2>Logbook</h2>
        <p class="muted-copy">Daily recorded flight time for the selected period.</p>
      </div>
      <div class="range-switch logbook-range" role="group" aria-label="Logbook period">
        <button
          v-for="period in periods"
          :key="period.days"
          type="button"
          :class="{ selected: selectedDays === period.days }"
          :aria-pressed="selectedDays === period.days"
          @click="selectedDays = period.days"
        >{{ period.label }}</button>
      </div>
    </section>

    <div class="logbook-summary">
      <article class="panel logbook-metric">
        <span class="eyebrow">FLIGHT TIME</span>
        <strong>{{ response?.totalHours.toFixed(1) ?? '—' }}<small> hrs</small></strong>
        <span>{{ periodLabel }}</span>
      </article>
      <article class="panel logbook-metric">
        <span class="eyebrow">DAYS WITH FLIGHT TIME</span>
        <strong>{{ recordedDays }}<small> days</small></strong>
        <span>Within the selected period</span>
      </article>
    </div>

    <section class="panel logbook-records">
      <div class="section-heading">
        <div>
          <span class="eyebrow">DAILY SUMMARY</span>
          <h3>Flight records</h3>
        </div>
        <span v-if="response" class="document-count">{{ response.records.length }} days</span>
      </div>

      <div v-if="loading && !response" class="chart-placeholder" role="status">Loading flight records…</div>
      <div v-else-if="errorMessage && !response" class="logbook-error inline-error" role="alert">
        {{ errorMessage }}
        <button type="button" @click="loadRecords">Retry</button>
      </div>
      <div v-else-if="response" class="logbook-table-wrap">
        <table class="logbook-table">
          <thead>
            <tr><th scope="col">Date</th><th scope="col">Record</th><th scope="col">Flight time</th></tr>
          </thead>
          <tbody>
            <tr v-for="record in visibleRecords" :key="record.date">
              <td><time :datetime="record.date">{{ formatIsoDate(record.date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) }}</time></td>
              <td>
                <span class="logbook-status" :class="record.hours > 0 ? 'has-hours' : 'no-hours'">
                  <i aria-hidden="true"></i>{{ record.hours > 0 ? 'Recorded' : 'No flight time' }}
                </span>
              </td>
              <td class="logbook-hours">{{ record.hours.toFixed(1) }} <small>hrs</small></td>
            </tr>
          </tbody>
        </table>
        <p v-if="errorMessage" class="logbook-refresh-error" role="alert">{{ errorMessage }}</p>
      </div>
    </section>
  </div>
</template>
