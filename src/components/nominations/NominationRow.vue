<script setup lang="ts">
import {computed} from 'vue'
import type {Nomination} from '@/api'
import NominationTitle from './NominationTitle.vue'
import NomineeCard from './NomineeCard.vue'
import NomineeStrip from './NomineeStrip.vue'

// Номинация на главной: заголовок, описание и лента номинантов (по макету Desktop-2).
const props = defineProps<{
  nomination: Nomination
  /** за кого пользователь уже проголосовал в этой номинации */
  votedNomineeId?: number | null
}>()

const emit = defineEmits<{ choose: [nomineeId: number] }>()

// после голоса подпись при наведении не нужна: карточка ведёт в анкету только для просмотра
const hoverLabel = computed(() => (props.votedNomineeId ? undefined : 'Выбрать'))

function stateOf(nomineeId: number) {
  return props.votedNomineeId === nomineeId ? 'selected' : 'idle'
}
</script>

<template>
  <section class="nomination-row" :aria-labelledby="`nomination-${nomination.id}`" :data-nomination-id="nomination.id">
    <NominationTitle :id="`nomination-${nomination.id}`" :nomination="nomination" year="2026"/>

    <NomineeStrip
        class="nomination-row__strip"
        :class="{ 'nomination-row__strip--pairs': nomination.type === 'PAIR' }"
        :count="nomination.nominees.length"
        :label="`Номинанты: ${nomination.name}`"
    >
      <li v-for="nominee in nomination.nominees" :key="nominee.id">
        <NomineeCard
            :nominee="nominee"
            :state="stateOf(nominee.id)"
            :badge="votedNomineeId === nominee.id ? 'Ваш выбор' : undefined"
            :hover-label="hoverLabel"
            @select="emit('choose', nominee.id)"
        />
      </li>
    </NomineeStrip>
  </section>
</template>

<style scoped>
.nomination-row {
  margin: 0;
}

.nomination-row__strip {
  margin-top: var(--space-6);
}
@media (min-width: 840px) {
  .nomination-row__strip--pairs { --per-view: 2; }
}
</style>
