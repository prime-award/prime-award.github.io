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
  padding-block: clamp(24px, 3vw, 60px) clamp(8px, 1vw, 16px);
}

.voting-info__title {
  margin: 0;
  font-family: var(--font-serif);
  font-weight: 700;
  font-size: clamp(22px, 2.5vw, 48px);
}

.voting-info__text {
  margin: 8px 0 0;
  font-family: var(--font-serif);
  font-size: clamp(16px, 1.875vw, 36px);
}
</style>
