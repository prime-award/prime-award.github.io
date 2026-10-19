<script setup lang="ts">
import type {Nomination} from '@/api'
import MomentCard from './MomentCard.vue'
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

function stateOf(nomineeId: number) {
  return props.votedNomineeId === nomineeId ? 'selected' : 'idle'
}
</script>

<template>
  <section class="nomination-row" :aria-labelledby="`nomination-${nomination.id}`" :data-nomination-id="nomination.id">
    <NominationTitle :id="`nomination-${nomination.id}`" :nomination="nomination" year="2026"/>

    <NomineeStrip class="nomination-row__strip" :count="nomination.nominees.length" :label="`Номинанты: ${nomination.name}`">
      <li v-for="nominee in nomination.nominees" :key="nominee.id">
        <MomentCard
            v-if="nomination.type === 'MOMENT'"
            :nominee="nominee"
            :state="stateOf(nominee.id)"
            :badge="votedNomineeId === nominee.id ? 'Ваш выбор' : undefined"
            :hover-label="votedNomineeId ? 'Смотреть' : 'Выбрать'"
            @select="emit('choose', nominee.id)"
        />
        <NomineeCard
            v-else
            :nominee="nominee"
            :state="stateOf(nominee.id)"
            :badge="votedNomineeId === nominee.id ? 'Ваш выбор' : undefined"
            :hover-label="votedNomineeId ? 'Смотреть' : 'Выбрать'"
            @select="emit('choose', nominee.id)"
        />
      </li>
    </NomineeStrip>
  </section>
</template>

<style scoped>
.nomination-row__strip {
  margin-top: var(--space-6);
}
</style>
