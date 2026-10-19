<script setup lang="ts">
import type {VotedNomination} from '@/api'
import {mediaUrl} from '@/utils/media.ts'

// «Ваш выбор»: фото номинанта, номинация, ник. Клик — анкета в режиме просмотра.
defineProps<{ item: VotedNomination }>()
</script>

<template>
  <RouterLink :to="`/vote/${item.nomination.id}`" class="voted-card" :data-nomination-id="item.nomination.id">
    <div class="voted-card__photo" :class="{ 'is-moment': item.nominee.type === 'MOMENT' }">
      <img v-if="item.nominee.photoPath" :src="mediaUrl(item.nominee.photoPath)" alt="" loading="lazy"/>
    </div>
    <h3 class="display voted-card__nomination">{{ item.nomination.name }}</h3>
    <p class="voted-card__nominee">{{ item.nominee.name }}</p>
  </RouterLink>
</template>

<style scoped>
/* M3 card: фото 3:4 (момент — 16:9), номинация — headline, ник — title */
.voted-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  height: 100%;
  padding: var(--space-6);
  border: 1px solid var(--border);
  border-radius: var(--shape-lg);
  background: var(--bg);
  color: inherit;
  text-align: center;
  text-decoration: none;
  transition: border-color 0.2s ease;
}

.voted-card:hover {
  border-color: var(--text);
}

.voted-card__photo {
  position: relative;
  width: 60%;
  aspect-ratio: 3 / 4;
  margin-bottom: var(--space-2);
  overflow: hidden;
  border-radius: var(--shape-md);
  background: radial-gradient(70% 60% at 50% 45%, rgba(104, 119, 137, 0.9) 0%, rgba(56, 64, 74, 0.45) 50%, transparent 100%);
}

.voted-card__photo.is-moment {
  width: 100%;
  aspect-ratio: 16 / 9;
}

.voted-card__photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
}

.voted-card__photo::after {
  content: '';
  position: absolute;
  inset: auto 0 0;
  height: 35%;
  background: linear-gradient(to top, var(--bg), transparent);
}

.voted-card__nomination {
  font: 400 var(--type-headline-m) var(--font-display);
}

.voted-card__nominee {
  margin: 0;
  color: var(--text-muted);
  font: 400 var(--type-title-l) var(--font-serif);
  text-transform: uppercase;
  overflow-wrap: anywhere;
}
</style>
