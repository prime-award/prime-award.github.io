<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref} from 'vue'
import {useAppConfig} from '@/composable/useAppConfig.ts'
import {formatRemaining} from '@/utils/countdown.ts'

// Обратный отсчёт до конца голосования (по оформлению — как DateBlock демо-экрана), обновляется в реальном времени.
const {config} = useAppConfig()

const now = ref(Date.now())
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  timer = setInterval(() => (now.value = Date.now()), 1000)
})
onBeforeUnmount(() => clearInterval(timer))

const endsAt = computed(() => (config.value ? new Date(config.value.votingEndsAt).getTime() : null))
const remaining = computed(() => (endsAt.value === null ? null : formatRemaining(endsAt.value - now.value)))
const endDate = computed(() =>
    endsAt.value === null
        ? ''
        : new Intl.DateTimeFormat('ru-RU', {
          day: 'numeric',
          month: 'long',
          timeZone: 'Europe/Moscow'
        }).format(endsAt.value),
)
</script>

<template>
  <section v-if="endsAt !== null" class="countdown" aria-live="polite">
    <h2 v-if="remaining" class="countdown__text">
      До завершения голосования<br/>
      <span class="countdown__value" data-testid="countdown">{{ remaining }}</span>
    </h2>
    <h2 v-else class="countdown__text">
      Голосование завершено<br/>
      <span class="countdown__value">{{ endDate }}</span>
    </h2>
  </section>
</template>

<style scoped>
.countdown {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: var(--space-8) var(--layout-margin);
}

.countdown__text {
  margin: 0;
  color: var(--text-muted);
  font: 400 var(--type-headline-s) var(--font-display);
  text-align: center;
}

.countdown__value {
  color: var(--text);
  font: 400 var(--type-display-s) var(--font-display);
  font-variant-numeric: tabular-nums;
}

@media (min-width: 840px) {
  .countdown {
    padding-block: var(--space-12);
  }

  .countdown__text {
    font: 400 var(--type-headline-l) var(--font-display);
  }

  .countdown__value {
    font: 400 var(--type-display-m) var(--font-display);
  }
}
</style>
