<script setup lang="ts">
import PairPortraits from '@/components/nominations/PairPortraits.vue'
import {computed} from 'vue'
import type {User, VotedNomination} from '@/api'
import primeLogo from '@/assets/prime-logo.webp'
import {mediaUrl} from '@/utils/media.ts'

/*
 * Картинка «Мой выбор» для «Поделиться»: 1080 px в ширину (стандарт соцсетей), снимок делается в браузере
 * (html-to-image -> canvas). Король и Королева рунета — крупными блоками, остальные выборы — компактным
 * списком в три колонки «номинация — за кого голос» с портретом/превью на фоне строки. При всех 50 голосах
 * высота ~2100 px.
 * Все картинки — со своего домена: аватар с CDN платформы может «испачкать» canvas, поэтому его заменяем буквой.
 */
const props = defineProps<{
  user: User
  voted: VotedNomination[]
  total: number
}>()

// крупные блоки — в этом порядке, если пользователь за них голосовал
const HERO_SLUGS = ['korol-runeta', 'koroleva-runeta']

const heroes = computed(() =>
    HERO_SLUGS.map((slug) => props.voted.find((v) => v.nomination.slug === slug)).filter((v) => v !== undefined),
)
const rest = computed(() => props.voted.filter((v) => !HERO_SLUGS.includes(v.nomination.slug)))

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
      <img :src="primeLogo" alt="PRIME 2026" class="share-card__logo"/>
      <div class="share-card__user">
        <span class="share-card__avatar" :style="{ '--accent': user.nameColor ?? '#687789' }">
          <img v-if="sameOriginAvatar" :src="sameOriginAvatar" alt=""/>
          <span v-else>{{ initial }}</span>
        </span>
        <span class="share-card__nick">{{ user.displayName }}</span>
      </div>
    </header>

    <div class="share-card__intro">
      <h2 class="share-card__title">Мой выбор</h2>
      <p class="share-card__subtitle">{{ voted.length }} из {{ total }} номинаций</p>
    </div>

    <!-- Король и Королева рунета: крупные портреты -->
    <section v-if="heroes.length" class="share-card__heroes" :class="{ 'is-single': heroes.length === 1 }">
      <article v-for="item in heroes" :key="item.nomination.id" class="share-card__hero">
        <img v-if="item.nominee.photoPath" class="share-card__hero-photo" :src="mediaUrl(item.nominee.photoPath)" alt=""/>
        <div class="share-card__hero-text">
          <span class="share-card__hero-nomination">{{ item.nomination.name }}</span>
          <span class="share-card__hero-name">{{ item.nominee.name }}</span>
        </div>
      </article>
    </section>

    <!-- остальное: «номинация — за кого голос», портрет/превью растворяется в фоне строки -->
    <ol v-if="rest.length" class="share-card__list">
      <li v-for="item in rest" :key="item.nomination.id" class="share-card__row">
        <PairPortraits v-if="item.nominee.type === 'PAIR'" :nominee="item.nominee" class="share-card__row-bg" eager/>
        <img v-else-if="item.nominee.photoPath" class="share-card__row-bg" :class="{ 'is-moment': item.nominee.type === 'MOMENT' }" :src="mediaUrl(item.nominee.photoPath)" alt=""/>
        <span class="share-card__row-nomination">{{ item.nomination.name }}</span>
        <span class="share-card__row-name">{{ item.nominee.name }}</span>
      </li>
    </ol>

    <footer class="share-card__footer">Голосуй на {{ site }}</footer>
  </div>
</template>

<style scoped>
/*
 * Изображение 1080 px в ширину, поэтому размеры — в px картинки, а не экрана: отступы кратны 8,
 * шрифты крупнее экранных (картинку смотрят уменьшенной в ленте соцсети).
 */
.share-card {
  width: 1080px;
  padding: 56px 48px 40px;
  background: radial-gradient(80% 30% at 50% 0%, rgba(104, 119, 137, 0.3) 0%, transparent 70%), #08090b;
  color: #e5e7ea;
  font-family: 'Inter', system-ui, sans-serif;
}

/* ---- шапка ---- */
.share-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.share-card__logo {
  width: auto;
  height: 64px;
}

.share-card__user {
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: 55%;
}

.share-card__avatar {
  display: grid;
  place-items: center;
  flex: none;
  width: 64px;
  height: 64px;
  overflow: hidden;
  border-radius: 50%;
  background: #15181d;
  box-shadow: 0 0 0 3px #08090b, 0 0 0 5px var(--accent);
  font: 400 32px/1 'Foglihten No06', Georgia, serif;
}

.share-card__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
}

.share-card__nick {
  overflow: hidden;
  font: 400 36px/44px 'Foglihten No06', Georgia, serif;
  text-transform: uppercase;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.share-card__intro {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 24px;
  margin: 40px 0 32px;
}

.share-card__title {
  margin: 0;
  font: 400 88px/88px 'Foglihten No06', Georgia, serif;
  text-transform: uppercase;
}

.share-card__subtitle {
  margin: 0;
  color: #8a96a5;
  font: 400 28px/36px 'Palatino Linotype', Palatino, 'PT Serif', Georgia, serif;
  white-space: nowrap;
}

/* ---- Король и Королева: портреты 4:5 ---- */
.share-card__heroes {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.share-card__heroes.is-single {
  grid-template-columns: 1fr;
  justify-items: center;
}

.share-card__hero {
  position: relative;
  width: 100%;
  max-width: 480px;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  border: 1px solid rgba(229, 231, 234, 0.25);
  border-radius: 24px;
  background: radial-gradient(70% 60% at 50% 40%, rgba(104, 119, 137, 0.9) 0%, rgba(56, 64, 74, 0.4) 55%, #0e1014 100%);
}

.share-card__hero-photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
}

.share-card__hero-text {
  position: absolute;
  inset: auto 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 120px 24px 32px;
  background: linear-gradient(to top, #08090b 0%, rgba(8, 9, 11, 0.85) 45%, transparent 100%);
  text-align: center;
}

.share-card__hero-nomination {
  color: #b8c0ca;
  font: 500 22px/28px 'Inter', system-ui, sans-serif;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.share-card__hero-name {
  font: 400 52px/60px 'Foglihten No06', Georgia, serif;
  text-transform: uppercase;
  overflow-wrap: anywhere;
}

/* ---- компактный список: три колонки, строка 64 px ---- */
.share-card__list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px 16px;
  margin: 24px 0 0;
  padding: 0;
  list-style: none;
}

.share-card__row {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  height: 64px;
  overflow: hidden;
  padding: 0 16px;
  border-radius: 12px;
  background: #0e1014;
}

/* портрет/превью — справа, растворяется в фон строки к тексту */
.share-card__row-bg {
  position: absolute;
  inset: 0 0 0 auto;
  width: 45%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 20%;
  opacity: 0.55;
}

.share-card__row-bg.is-moment {
  object-position: center;
}

.share-card__row::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(90deg, #0e1014 50%, rgba(14, 16, 20, 0.6) 75%, rgba(14, 16, 20, 0.15) 100%);
}

.share-card__row-nomination,
.share-card__row-name {
  position: relative;
  z-index: 2;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.share-card__row-nomination {
  color: #8a96a5;
  font: 500 14px/18px 'Inter', system-ui, sans-serif;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.share-card__row-name {
  font: 400 24px/30px 'Palatino Linotype', Palatino, 'PT Serif', Georgia, serif;
}

.share-card__footer {
  margin-top: 32px;
  color: #687789;
  font: 400 24px/32px 'Inter', system-ui, sans-serif;
  text-align: center;
}
</style>
