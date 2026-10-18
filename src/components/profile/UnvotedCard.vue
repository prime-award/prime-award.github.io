<script setup lang="ts">
import type {NominationBrief} from '@/api'
import PrimeButton from '@/components/ui/PrimeButton.vue'
import {mediaUrl} from '@/utils/media.ts'

// «Ждут вашего голоса»: плашка, название, «Сделать выбор» -> анкета
defineProps<{ nomination: NominationBrief }>()
</script>

<template>
  <article class="unvoted-card" :data-nomination-id="nomination.id">
    <img v-if="nomination.iconPath" class="unvoted-card__icon" :src="mediaUrl(nomination.iconPath)" alt="" loading="lazy"/>
    <h3 class="display unvoted-card__name">{{ nomination.name }}</h3>
    <p class="unvoted-card__description">{{ nomination.description }}</p>
    <PrimeButton class="unvoted-card__cta" :to="`/vote/${nomination.id}`" data-testid="make-choice">Сделать выбор</PrimeButton>
  </article>
</template>

<style scoped>
.unvoted-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  /* макет: обводка 2px #687789, скругление 50, отступы 56/15 */
  padding: clamp(24px, 2.9vw, 56px) clamp(12px, 1.2vw, 24px);
  border: 2px solid var(--border);
  border-radius: clamp(28px, 2.6vw, 50px);
  background: var(--bg);
  text-align: center;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.unvoted-card:hover {
  border-color: var(--text);
  box-shadow: 0 0 22px rgba(229, 231, 234, 0.08);
}

.unvoted-card__icon {
  width: min(70%, 400px);
  height: auto;
  aspect-ratio: 380 / 185;
  object-fit: contain;
}

.unvoted-card__name {
  margin-top: clamp(16px, 1.5vw, 29px);
  font-size: clamp(26px, 3.07vw, 59px);
  line-height: 1.05;
  color: #fff;
}

.unvoted-card__cta {
  padding: 0.62em 0.94em;
  font-size: clamp(16px, 1.67vw, 32px);
}

.unvoted-card__description {
  flex: 1;
  margin: 10px 0 20px;
  color: rgba(229, 231, 234, 0.6);
  font-family: var(--font-serif);
  font-size: clamp(14px, 0.95vw, 18px);
  line-height: 1.35;
}
</style>
