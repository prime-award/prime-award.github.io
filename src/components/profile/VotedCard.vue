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
.voted-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  padding: clamp(20px, 2.4vw, 40px) clamp(16px, 1.6vw, 28px);
  border: 1px solid var(--line);
  border-radius: var(--radius-card);
  background: var(--bg);
  color: inherit;
  text-align: center;
  text-decoration: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.voted-card:hover {
  border-color: var(--line-strong);
  box-shadow: 0 0 22px rgba(229, 231, 234, 0.08);
}

.voted-card__photo {
  position: relative;
  width: min(65%, 300px);
  aspect-ratio: 370 / 450;
  overflow: hidden;
  border-radius: 14px;
  background: radial-gradient(circle at 50% 35%, #687789 0%, #1a1e24 45%, var(--bg) 100%);
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
  inset: 0;
  background: linear-gradient(to top, rgba(8, 9, 11, 0.85) 0%, transparent 35%);
}

.voted-card__nomination {
  margin-top: clamp(14px, 1.4vw, 24px);
  font-size: clamp(22px, 2vw, 40px);
  line-height: 1.1;
}

.voted-card__nominee {
  margin: 10px 0 0;
  color: var(--muted-2);
  font-family: var(--font-display);
  font-size: clamp(18px, 1.5vw, 28px);
  text-transform: uppercase;
  overflow-wrap: anywhere;
}
</style>
