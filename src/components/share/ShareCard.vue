<script setup lang="ts">
import {computed} from 'vue'
import type {User, VotedNomination} from '@/api'
import primeLogo from '@/assets/prime-logo.webp'
import {mediaUrl} from '@/utils/media.ts'

/*
 * Картинка «Мой выбор» для «Поделиться». Вёрстка фиксированной ширины (1080 px), её снимок
 * делается в браузере (html-to-image -> canvas -> PNG). Все картинки берём со своего домена:
 * аватар с CDN платформы может «испачкать» canvas, поэтому чужой аватар заменяем буквой ника.
 */
const props = defineProps<{
  user: User
  voted: VotedNomination[]
  total: number
}>()

const sameOriginAvatar = computed(() => {
  const url = mediaUrl(props.user.avatarUrl)
  if (!url) return null
  try {
    return new URL(url, window.location.href).origin === window.location.origin ? url : null
  } catch {
    return null
  }
})
const initial = computed(() => props.user.displayName.trim().charAt(0).toUpperCase() || '?')
const site = window.location.host
</script>

<template>
  <div class="share-card">
    <header class="share-card__head">
      <div class="share-card__brand">
        <img :src="primeLogo" alt="PRIME" class="share-card__logo"/>
        <span class="share-card__year">2026</span>
      </div>
      <div class="share-card__user">
        <span class="share-card__avatar" :style="{ background: user.nameColor ?? '#687789' }">
          <img v-if="sameOriginAvatar" :src="sameOriginAvatar" alt=""/>
          <span v-else>{{ initial }}</span>
        </span>
        <span class="share-card__nick" :style="{ color: user.nameColor ?? undefined }">{{ user.displayName }}</span>
      </div>
    </header>

    <h2 class="share-card__title">Мой выбор</h2>
    <p class="share-card__subtitle">Главная народная премия ру-стриминга · {{ voted.length }} из {{ total }} номинаций</p>

    <ol class="share-card__grid">
      <li v-for="item in voted" :key="item.nomination.id" class="share-card__item">
        <div class="share-card__photo" :class="{ 'is-moment': item.nominee.type === 'MOMENT' }">
          <img v-if="item.nominee.photoPath" :src="mediaUrl(item.nominee.photoPath)" alt=""/>
        </div>
        <div class="share-card__text">
          <span class="share-card__nomination">{{ item.nomination.name }}</span>
          <span class="share-card__nominee">{{ item.nominee.name }}</span>
        </div>
      </li>
    </ol>

    <footer class="share-card__footer">Голосуй на {{ site }}</footer>
  </div>
</template>

<style scoped>
/*
 * Изображение 1080 px в ширину (стандарт для соцсетей), поэтому размеры здесь в px картинки, а не экрана:
 * отступы кратны 8, шрифты — шкала M3, увеличенная в 1.5 раза (картинку смотрят уменьшенной на телефоне).
 */
.share-card {
  width: 1080px;
  padding: 64px 56px 48px;
  background: radial-gradient(90% 40% at 50% 0%, rgba(104, 119, 137, 0.35) 0%, transparent 70%), #08090b;
  color: #e5e7ea;
  font-family: 'Inter', system-ui, sans-serif;
}

.share-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.share-card__brand {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.share-card__logo {
  width: 256px;
  height: auto;
}

.share-card__year {
  font: 400 33px/42px 'Foglihten No06', Georgia, serif; /* title-l ×1.5 */
}

.share-card__user {
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: 50%;
}

.share-card__avatar {
  display: grid;
  place-items: center;
  flex: none;
  width: 64px;
  height: 64px;
  overflow: hidden;
  border-radius: 50%;
  font: 400 32px/1 'Foglihten No06', Georgia, serif;
  color: #08090b;
}

.share-card__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
}

.share-card__nick {
  overflow: hidden;
  font: 500 33px/42px 'Inter', system-ui, sans-serif; /* title-l ×1.5 */
  white-space: nowrap;
  text-overflow: ellipsis;
}

.share-card__title {
  margin: 48px 0 0;
  font: 400 85px/96px 'Foglihten No06', Georgia, serif; /* display-l ×1.5 */
  text-transform: uppercase;
}

.share-card__subtitle {
  margin: 16px 0 0;
  color: #8a96a5;
  font: 400 24px/36px 'Inter', system-ui, sans-serif; /* body-l ×1.5 */
}

.share-card__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin: 48px 0 0;
  padding: 0;
  list-style: none;
}

.share-card__item {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(229, 231, 234, 0.2);
  border-radius: 24px;
  background: #0e1014;
}

.share-card__photo {
  aspect-ratio: 3 / 4;
  overflow: hidden;
  background: radial-gradient(70% 60% at 50% 45%, rgba(104, 119, 137, 0.9) 0%, rgba(56, 64, 74, 0.45) 50%, #08090b 100%);
}

.share-card__photo.is-moment {
  aspect-ratio: 16 / 9;
  margin-bottom: auto;
}

.share-card__photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
}

.share-card__text {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 24px 24px;
}

.share-card__nomination {
  color: #8a96a5;
  font: 500 18px/24px 'Inter', system-ui, sans-serif; /* label-m ×1.5 */
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.share-card__nominee {
  font: 400 33px/42px 'Foglihten No06', Georgia, serif; /* title-l ×1.5 */
  text-transform: uppercase;
  overflow-wrap: anywhere;
}

.share-card__footer {
  margin-top: 48px;
  color: #687789;
  font: 400 24px/36px 'Inter', system-ui, sans-serif;
  text-align: center;
}
</style>
