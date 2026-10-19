<script setup lang="ts">
import {computed} from 'vue'
import {useAppConfig} from '@/composable/useAppConfig.ts'

const {config} = useAppConfig()

const deadline = computed(() => {
  if (!config.value) return null
  return new Intl.DateTimeFormat('ru-RU', {day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Moscow'})
      .format(new Date(config.value.votingEndsAt))
})
</script>

<template>
  <section class="voting-info page-container">
    <h2 class="voting-info__title">
      <template v-if="!config">Голосование</template>
      <template v-else-if="config.votingOpen">Голосование открыто до {{ deadline }}</template>
      <template v-else>Голосование завершено {{ deadline }}</template>
    </h2>
    <p class="voting-info__text">Выбирайте своих фаворитов среди главных имён года.</p>
  </section>
</template>

<style scoped>
.voting-info {
  padding-block: var(--space-12) 0;
}

.voting-info__title {
  margin: 0;
  font: 700 var(--type-headline-s) var(--font-serif);
}

.voting-info__text {
  margin: var(--space-2) 0 0;
  color: var(--text-muted);
  font: var(--type-body-l) var(--font-serif);
}

@media (min-width: 840px) {
  .voting-info__title {
    font: 700 var(--type-headline-l) var(--font-serif);
  }

  .voting-info__text {
    font: var(--type-title-l) var(--font-serif);
  }
}
</style>
