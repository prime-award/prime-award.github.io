<script setup lang="ts">
import {vFitText} from '@/directives/fitText'
import PairPortraits from '@/components/nominations/PairPortraits.vue'
import type {VotedNomination} from '@/api'
import {mediaUrl} from '@/utils/media.ts'

defineProps<{ item: VotedNomination }>()
</script>

<template>
  <RouterLink
      :to="`/vote/${item.nomination.id}`"
      class="voted-card"
      :data-nomination-id="item.nomination.id"
  >
    <PairPortraits v-if="item.nominee.type === 'PAIR'" class="voted-card__portraits" :nominee="item.nominee"/>
    <div v-else-if="item.nominee.photoPath" class="voted-card__photo">
      <img :src="mediaUrl(item.nominee.photoPath)" alt="" loading="lazy"/>
    </div>
    <div class="voted-card__body">
      <h3 v-fit-text="item.nomination.name" class="display voted-card__nomination">{{ item.nomination.name }}</h3>
      <p v-fit-text="item.nominee.name" class="voted-card__nominee">{{ item.nominee.name }}</p>
    </div>
  </RouterLink>
</template>

<style scoped>
/* M3 card: фото и задник — на всю ширину карточки (3:4), текст по центру под ним */
.voted-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100%;
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

.voted-card__portraits,
.voted-card__photo {
  flex: 1;
  min-height: 0;
  height: auto;
}

.voted-card__body {
  flex-shrink: 0;
  overflow-wrap: anywhere;
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
  white-space: nowrap;
  margin: 0;
  padding: var(--space-2) var(--space-4) 0;
  font: 400 var(--type-headline-m) var(--font-display);
}

.voted-card__nominee {
  white-space: nowrap;
  margin: 0;
  padding: var(--space-1) var(--space-4) var(--space-5);
  color: var(--text-muted);
  font: 400 var(--type-title-l) var(--font-serif);
  text-transform: uppercase;
}
</style>
