<script setup lang="ts">
import NomineeCard from './NomineeCard.vue'
import PairPortraits from './PairPortraits.vue'
import type {NomineeCardProps} from './cardState'

const props = defineProps<NomineeCardProps>()
const emit = defineEmits<{select: [], seek: [seconds: number]}>()
</script>

<template>
  <NomineeCard v-bind="props" @select="emit('select')" @seek="emit('seek', $event)">
    <template #media>
      <PairPortraits :nominee="nominee" :eager="eager"/>
    </template>
  </NomineeCard>
</template>
