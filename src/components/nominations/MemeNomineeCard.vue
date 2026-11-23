<script setup lang="ts">
import NomineeCard from './NomineeCard.vue'
import {formatTimecode, type NomineeCardProps} from './cardState'

const props = defineProps<NomineeCardProps>()
const emit = defineEmits<{select: [], seek: [seconds: number]}>()
</script>

<template>
  <div class="meme-card">
    <NomineeCard v-bind="props" @select="emit('select')" @seek="emit('seek', $event)">
      <template #content>
        <span class="meme-card__name">{{ nominee.name }}</span>
      </template>
    </NomineeCard>
    <span v-if="timing == null && nominee.timecodeSeconds" class="meme-card__timing">
      {{ formatTimecode(nominee.timecodeSeconds) }}
    </span>
  </div>
</template>

<style scoped>
.meme-card {
  display: grid;
  grid-template-rows: 1fr auto;
  height: 100%;
}

.meme-card__name {
  color: var(--text);
  font: 400 var(--type-title-l) var(--font-serif);
  text-align: center;
  text-wrap: balance;
  overflow-wrap: anywhere;
}

.meme-card__timing {
  margin-top: var(--space-1);
  color: var(--muted-2);
  font: var(--type-body-m) var(--font-text);
  font-variant-numeric: tabular-nums;
  text-align: center;
}
</style>
