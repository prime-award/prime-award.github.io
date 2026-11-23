<script setup lang="ts">
import {vFitText} from '@/directives/fitText'
import NomineeCard from './NomineeCard.vue'
import {formatTimecode, type NomineeCardProps} from './cardState'

const props = defineProps<NomineeCardProps>()
const emit = defineEmits<{select: [], seek: [seconds: number]}>()
</script>

<template>
  <div class="meme-card">
    <NomineeCard v-bind="props" @select="emit('select')" @seek="emit('seek', $event)">
      <template #content>
        <span v-fit-text="nominee.name" class="meme-card__name">{{ nominee.name }}</span>
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
  white-space: nowrap;
  color: var(--text);
  font: 400 var(--type-title-l) var(--font-serif);
  text-align: center;
}

.meme-card__timing {
  margin-top: var(--space-1);
  color: var(--muted-2);
  font: var(--type-body-m) var(--font-text);
  font-variant-numeric: tabular-nums;
  text-align: center;
}
</style>
