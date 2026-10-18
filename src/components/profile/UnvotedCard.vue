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
    <PrimeButton class="unvoted-card__cta" :to="`/vote/${nomination.id}`" size="sm" data-testid="make-choice">Сделать выбор</PrimeButton>
  </article>
</template>

<style scoped>
.unvoted-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  padding: clamp(20px, 2.4vw, 40px) clamp(16px, 1.6vw, 28px);
  border: 1px solid var(--line);
  border-radius: var(--radius-card);
  background: var(--bg);
  text-align: center;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.unvoted-card:hover {
  border-color: var(--line-strong);
  box-shadow: 0 0 22px rgba(229, 231, 234, 0.08);
}

.unvoted-card__icon {
  width: min(70%, 400px);
  height: auto;
  aspect-ratio: 380 / 185;
  object-fit: contain;
}

.unvoted-card__name {
  margin-top: clamp(16px, 1.6vw, 28px);
  font-size: clamp(24px, 2.2vw, 44px);
  line-height: 1.1;
}

.unvoted-card__description {
  flex: 1;
  margin: 10px 0 20px;
  color: var(--muted-2);
  font-size: 14px;
  line-height: 1.4;
}
</style>
