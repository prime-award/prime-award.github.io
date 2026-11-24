<script setup lang="ts">
import {vFitText} from '@/directives/fitText'
import type {NominationBrief} from '@/api'
import PrimeButton from '@/components/ui/PrimeButton.vue'
import {mediaUrl} from '@/utils/media.ts'

// «Ждут вашего голоса»: плашка, название, «Сделать выбор» -> анкета
defineProps<{ nomination: NominationBrief }>()
</script>

<template>
  <article class="unvoted-card" :data-nomination-id="nomination.id">
    <img v-if="nomination.iconPath" class="unvoted-card__icon" :src="mediaUrl(nomination.iconPath)" alt="" loading="lazy"/>
    <h3 v-fit-text="nomination.name" class="display unvoted-card__name">{{ nomination.name }}</h3>
    <p class="unvoted-card__description">{{ nomination.description }}</p>
    <PrimeButton class="unvoted-card__cta" :to="`/vote/${nomination.position}`" data-testid="make-choice">Сделать выбор</PrimeButton>
  </article>
</template>

<style scoped>
/* M3 card: поля 24dp, скругление 16dp; плашка 64dp высотой, название — headline */
.unvoted-card {
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  height: 100%;
  padding: var(--space-6);
  border: 1px solid var(--border);
  border-radius: var(--shape-lg);
  background: var(--bg);
  text-align: center;
  transition: border-color 0.2s ease;
}

.unvoted-card:hover,
.unvoted-card:focus-within {
  border-color: var(--text);
}

.unvoted-card__icon {
  width: auto;
  height: var(--space-16);
}

.unvoted-card__name {
  white-space: nowrap;
  align-self: stretch;
  font: 400 var(--type-headline-m) var(--font-display);
  color: #fff;
}

.unvoted-card__description {
  flex: 1;
  margin: 0;
  color: var(--text-muted);
  font: var(--type-body-m) var(--font-serif);
}

.unvoted-card__cta {
  margin-top: var(--space-2);
}
/* Расширяем область ссылки «Сделать выбор» до границ карточки. */
.unvoted-card__cta::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: var(--shape-lg);
}
</style>
