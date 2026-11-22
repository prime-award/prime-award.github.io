<script setup lang="ts">
import PairPortraits from '@/components/nominations/PairPortraits.vue'
import {computed} from 'vue'
import type {VotedNomination} from '@/api'
import {mediaUrl} from '@/utils/media.ts'

// «Ваш выбор»: фото номинанта, номинация, ник. Клик — анкета в режиме просмотра.
// Момент — по структуре карточки момента (MomentCard): превью 16:9 внутри карточки, под ним номинация,
// название и участники.
const props = defineProps<{ item: VotedNomination }>()
const isMoment = computed(() => props.item.nominee.type === 'MOMENT')
</script>

<template>
  <RouterLink
      :to="`/vote/${item.nomination.id}`"
      class="voted-card"
      :class="{ 'is-moment': isMoment }"
      :data-nomination-id="item.nomination.id"
  >
    <PairPortraits v-if="item.nominee.type === 'PAIR'" :nominee="item.nominee"/>
    <div v-else-if="item.nominee.photoPath" class="voted-card__photo">
      <img :src="mediaUrl(item.nominee.photoPath)" alt="" loading="lazy"/>
    </div>
    <div class="voted-card__body">
      <h3 class="display voted-card__nomination">{{ item.nomination.name }}</h3>
      <p class="voted-card__nominee">{{ item.nominee.name }}</p>
      <p v-if="isMoment && item.nominee.participants" class="voted-card__participants">{{ item.nominee.participants }}</p>
    </div>
  </RouterLink>
</template>

<style scoped>
/* M3 card: фото и задник — на всю ширину карточки (3:4), текст по центру под ним */
.voted-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--shape-lg);
  background: var(--bg);
  color: inherit;
  text-align: center;
  text-decoration: none;
  transition: border-color 0.2s ease;
  aspect-ratio: 3 / 4;
}

.voted-card:hover {
  border-color: var(--text);
}

.voted-card__photo {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: radial-gradient(70% 60% at 50% 45%, rgba(104, 119, 137, 0.9) 0%, rgba(56, 64, 74, 0.45) 50%, transparent 100%);
}


.voted-card__photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
}

/* фото плавно переходит в фон карточки под текстом */
.voted-card__photo::after {
  content: '';
  position: absolute;
  inset: auto 0 0;
  height: 40%;
  background: linear-gradient(to top, var(--bg), transparent);
}

.voted-card__nomination {
  margin: 0;
  padding: var(--space-2) var(--space-4) 0;
  font: 400 var(--type-headline-m) var(--font-display);
}

.voted-card__nominee {
  margin: 0;
  padding: var(--space-1) var(--space-4) var(--space-5);
  color: var(--text-muted);
  font: 400 var(--type-title-l) var(--font-serif);
  text-transform: uppercase;
  overflow-wrap: anywhere;
}

/*
 * Момент — как MomentCard: поля 8dp, превью 16:9 со скруглением 12dp, текст под ним.
 * Высота по содержимому; в ряду со стримерами текст встаёт по центру оставшегося места.
 */
.voted-card.is-moment {
  aspect-ratio: auto;
  padding: var(--space-2);
}

.voted-card.is-moment .voted-card__photo {
  flex: none;
  aspect-ratio: 16 / 9;
  border-radius: var(--shape-md);
  background: var(--surface-2);
}

.voted-card.is-moment .voted-card__photo img {
  object-position: 50% 20%;
  opacity: 0.8;
}

.voted-card.is-moment .voted-card__photo::after {
  height: 50%;
}

.voted-card.is-moment .voted-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-2) var(--space-4);
  text-wrap: balance;
}

.voted-card.is-moment .voted-card__nomination,
.voted-card.is-moment .voted-card__nominee {
  padding: 0;
}

.voted-card.is-moment .voted-card__nominee {
  color: var(--text);
  text-transform: none;
}

.voted-card__participants {
  margin: 0;
  color: var(--text-subtle);
  font: var(--type-body-m) var(--font-serif);
}
</style>
