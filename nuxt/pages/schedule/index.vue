<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import type { ScheduleRecord, SchedulesResponse } from '~/types/api';
import { calendarCells, monthLabel, moveMonth } from '~/utils/calendar';

const api = useApi();
const assessmentDate = useRuntimeConfig().public.assessmentDate;
const [assessmentYear, assessmentMonth] = assessmentDate.split('-').map(Number);
const displayedYear = ref(assessmentYear);
const displayedMonth = ref(assessmentMonth);
const calendar = ref<SchedulesResponse | null>(null);
const loading = ref(false);
const errorMessage = ref('');
const selectedDate = ref<string | null>(null);
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const cells = computed(() => calendarCells(displayedYear.value, displayedMonth.value));
const heading = computed(() => monthLabel(displayedYear.value, displayedMonth.value));
const schedulesByDate = computed(() => {
  const grouped = new Map<string, ScheduleRecord[]>();
  for (const schedule of calendar.value?.schedules ?? []) {
    const existing = grouped.get(schedule.duty_date) ?? [];
    existing.push(schedule);
    grouped.set(schedule.duty_date, existing);
  }
  return grouped;
});
const selectedSchedules = computed(() =>
  selectedDate.value ? schedulesByDate.value.get(selectedDate.value) ?? [] : [],
);

async function loadMonth() {
  loading.value = true;
  errorMessage.value = '';
  selectedDate.value = null;
  try {
    calendar.value = await api.request<SchedulesResponse>(
      '/schedules?year=' + displayedYear.value + '&month=' + displayedMonth.value,
    );
  } catch (error) {
    const result = error as { data?: { message?: string | string[] } };
    const message = result.data?.message;
    errorMessage.value = Array.isArray(message) ? message.join('. ') : message ?? 'Could not load this month.';
  } finally {
    loading.value = false;
  }
}

function shiftMonthBy(offset: number) {
  const next = moveMonth(displayedYear.value, displayedMonth.value, offset);
  displayedYear.value = next.year;
  displayedMonth.value = next.month;
}

function isReferenceDate(date: string) {
  return date === calendar.value?.referenceDate;
}

onMounted(() => void loadMonth());
watch([displayedYear, displayedMonth], () => void loadMonth());
</script>

<template>
  <div class="schedule-page">
    <section class="welcome-row">
      <div><span class="eyebrow">DUTY OVERVIEW</span><h2>Monthly schedule</h2><p class="muted-copy">Review duty days, status and logged flights.</p></div>
      <div class="month-controls" aria-label="Calendar month controls">
        <button type="button" class="month-arrow" aria-label="Previous month" @click="shiftMonthBy(-1)">←</button>
        <strong>{{ heading }}</strong>
        <button type="button" class="month-arrow" aria-label="Next month" @click="shiftMonthBy(1)">→</button>
      </div>
    </section>

    <section class="panel calendar-panel">
      <div class="calendar-topline">
        <div><span class="eyebrow">PILOT DUTY CALENDAR</span><h3>{{ heading }}</h3></div>
        <span v-if="calendar" class="as-of-label">As of · {{ calendar.referenceDate }}</span>
      </div>
      <div v-if="errorMessage" class="inline-error" role="alert">{{ errorMessage }} <button type="button" @click="loadMonth">Retry</button></div>

      <div class="calendar-grid" :class="{ 'calendar-loading': loading }" aria-label="Monthly schedule calendar">
        <div v-for="day in weekdays" :key="day" class="weekday-cell">{{ day }}</div>
        <button
          v-for="cell in cells"
          :key="cell.date"
          type="button"
          class="calendar-cell"
          :class="{ 'outside-month': !cell.currentMonth, 'is-today': isReferenceDate(cell.date), 'has-duty': (schedulesByDate.get(cell.date)?.length ?? 0) > 0 }"
          :disabled="loading || !cell.currentMonth"
          :aria-label="cell.date + (schedulesByDate.has(cell.date) ? ', duty scheduled' : '')"
          @click="selectedDate = cell.date"
        >
          <span class="calendar-day-number">{{ cell.day }}</span>
          <div class="calendar-duties">
            <div v-for="schedule in schedulesByDate.get(cell.date) ?? []" :key="schedule.id" class="calendar-duty" :style="{ '--duty-color': schedule.base_color }" :title="schedule.duty_type + ' · ' + schedule.base_name">
              <span class="duty-code">{{ schedule.base_name }}</span>
              <span class="duty-count" :class="{ 'is-complete': schedule.count_logbooks === schedule.count_schedules }">
                {{ schedule.count_logbooks === schedule.count_schedules ? '✓' : Math.max(0, schedule.count_schedules - schedule.count_logbooks) }}
              </span>
            </div>
          </div>
          <span v-if="schedulesByDate.has(cell.date)" class="calendar-status">{{ schedulesByDate.get(cell.date)?.[0]?.status === 2 ? 'Verified' : 'Upcoming' }}</span>
        </button>
      </div>

      <div v-if="selectedDate" class="selected-date-panel" aria-live="polite">
        <div><span class="eyebrow">{{ selectedDate }}</span><strong>{{ selectedSchedules.length ? selectedSchedules.length + ' duty entr' + (selectedSchedules.length === 1 ? 'y' : 'ies') : 'No scheduled duty' }}</strong></div>
        <NuxtLink :to="'/schedule/detail?date=' + selectedDate" class="detail-placeholder-link">View date <span aria-hidden="true">→</span></NuxtLink>
      </div>

      <div class="calendar-legend">
        <div class="legend-title">Duty type</div>
        <div class="legend-items">
          <span v-for="entry in calendar?.legend ?? []" :key="entry.code" class="calendar-legend-item"><i :style="{ backgroundColor: entry.color }"></i>{{ entry.label }}</span>
        </div>
      </div>
      <div v-if="loading" class="loading-overlay" role="status">Loading schedule…</div>
      <div v-else-if="calendar && calendar.schedules.length === 0" class="empty-month">No duty records for this month.</div>
    </section>
  </div>
</template>
