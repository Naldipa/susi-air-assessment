<script setup lang="ts">
import type { PilotDocument } from '~/types/api';

defineProps<{ document: PilotDocument }>();

const statusLabel = (status: PilotDocument['status']) =>
  status === 'expired' ? 'Expired' : status === 'soon' ? 'Due soon' : 'Valid';
const remainingLabel = (days: number) =>
  days < 0 ? Math.abs(days) + ' days overdue' : days === 0 ? 'Expires today' : days + ' days left';
</script>

<template>
  <article class="document-row">
    <div class="document-symbol" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d="M7 3.5h7l4 4v13H7a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z" /><path d="M14 3.5v4h4M8.5 12h7M8.5 16h7" /></svg>
    </div>
    <div class="document-copy">
      <strong>{{ document.label }}</strong>
      <span>Expires {{ document.expiryDate }}</span>
    </div>
    <div class="document-state" :class="'state-' + document.status">
      <span class="state-label"><i class="state-dot"></i><span class="state-text">{{ statusLabel(document.status) }}</span></span>
      <small>{{ remainingLabel(document.daysRemaining) }}</small>
    </div>
  </article>
</template>
