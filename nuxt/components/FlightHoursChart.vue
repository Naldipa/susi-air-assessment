<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { Chart } from 'chart.js';
import type { FlightHoursPoint } from '~/types/api';

const props = defineProps<{
  points: FlightHoursPoint[];
  limit: number;
  chartMax: number;
}>();

const canvas = ref<HTMLCanvasElement | null>(null);
let chart: Chart<'line'> | null = null;

async function drawChart() {
  if (!import.meta.client || !canvas.value) return;
  const chartModule = await import('chart.js/auto');
  if (chart) chart.destroy();

  chart = new chartModule.default(canvas.value, {
    type: 'line',
    data: {
      labels: props.points.map((point) =>
        new Date(point.date + 'T12:00:00Z').toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          timeZone: 'UTC',
        }),
      ),
      datasets: [
        {
          label: 'Rolling flight hours',
          data: props.points.map((point) => point.rollingHours),
          borderColor: '#0E2138',
          backgroundColor: 'rgba(14, 33, 56, 0.08)',
          pointBackgroundColor: '#0E2138',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          fill: true,
          tension: 0.34,
        },
        {
          label: 'Regulatory limit',
          data: props.points.map(() => props.limit),
          borderColor: '#E63757',
          borderWidth: 1.5,
          borderDash: [6, 5],
          pointRadius: 0,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            boxWidth: 7,
            color: '#6B7280',
            font: { family: 'Segoe UI, Arial, sans-serif', size: 11 },
          },
        },
        tooltip: {
          callbacks: {
            label: (context) =>
              context.datasetIndex === 0
                ? ' ' + Number(context.parsed.y).toFixed(1) + ' rolling hours'
                : ' Limit · ' + Number(context.parsed.y).toFixed(0) + 'h',
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { maxTicksLimit: 8, color: '#7B8794', font: { size: 10 } },
          border: { display: false },
        },
        y: {
          beginAtZero: true,
          max: props.chartMax,
          grid: { color: '#EEF1F4' },
          ticks: { color: '#7B8794', font: { size: 10 } },
          border: { display: false },
        },
      },
    },
  });
}

onMounted(() => void drawChart());
watch(
  () => [props.points, props.limit, props.chartMax],
  () => void drawChart(),
  { deep: true },
);
onBeforeUnmount(() => chart?.destroy());
</script>

<template>
  <div class="chart-canvas-wrap">
    <canvas ref="canvas" role="img" aria-label="Rolling flight hours compared with the regulatory limit"></canvas>
  </div>
</template>
