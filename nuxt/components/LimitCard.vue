<script setup lang="ts">
import { computed } from 'vue';
import type { LimitCardItem } from '~/types/api';

const props = defineProps<{ card: LimitCardItem }>();
const progressWidth = computed(() => Math.min(100, Math.max(0, props.card.percentage)) + '%');
const stateClass = computed(() =>
  props.card.percentage >= 100 ? 'is-over' : props.card.percentage >= 80 ? 'is-near' : 'is-safe',
);
</script>

<template>
  <article class="limit-card" :class="stateClass">
    <div class="limit-card-top">
      <span class="limit-label">{{ card.label }} limit</span>
      <span class="limit-window">Last {{ card.windowDays }} {{ card.windowDays === 1 ? 'day' : 'days' }}</span>
    </div>
    <div class="limit-value-row">
      <strong>{{ card.usedHours.toFixed(1) }}<small>h</small></strong>
      <span class="limit-cap">of {{ card.limit }}h</span>
    </div>
    <div class="progress-track" role="progressbar" :aria-valuenow="card.percentage" aria-valuemin="0" aria-valuemax="100" :aria-label="card.label + ' flight-hour usage'">
      <span class="progress-fill" :style="{ width: progressWidth }"></span>
    </div>
    <div class="limit-foot">
      <span>{{ card.percentage }}% used</span>
      <span>{{ Math.max(0, card.limit - card.usedHours).toFixed(1) }}h remaining</span>
    </div>
  </article>
</template>
