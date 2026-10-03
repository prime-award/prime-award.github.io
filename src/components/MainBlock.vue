<script setup>
import {ref, onMounted} from 'vue'
import heroBg from '../assets/hero-bg.png'
import primeLogo from '../assets/prime-logo.png'
import MainButton from "./MainButton.vue";

const mounted = ref(false)

onMounted(() => {
  // Небольшая задержка, чтобы браузер отрисовал начальное состояние
  requestAnimationFrame(() => {
    mounted.value = true
  })
})
</script>

<template>
  <section
      class="main-block"
      :class="{ 'is-ready': mounted }"
      :style="{ '--hero-bg': `url(${heroBg})` }"
  >
    <!-- Анимированный фон -->
    <div class="bg" aria-hidden="true">
      <!-- Картинка + редкие глитч-копии. Дрейфует вся сцена целиком -->
      <div class="bg-stage">
        <div class="bg-layer"></div>
        <div class="bg-layer bg-glitch bg-glitch--r"></div>
        <div class="bg-layer bg-glitch bg-glitch--b"></div>
      </div>

      <!-- Атмосфера проявляется чуть позже картинки -->
      <div class="bg-fx">
        <div class="bg-beam bg-beam--l"></div>
        <div class="bg-beam bg-beam--r"></div>
        <div class="bg-flicker"></div>
        <div class="bg-grain"></div>
      </div>
    </div>

    <div class="content">
      <div class="logo" role="img" aria-label="PRIME">
        <img :src="primeLogo" alt=""/>
      </div>

      <h1 class="title">
        <span class="title-line">Кто станет</span>
        <span class="title-line">королём рунета 2026?</span>
      </h1>

      <div class="cta-wrap">
        <MainButton href="#apply">Участвовать в отборе</MainButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.main-block {
  /* Цвет прожекторов (R, G, B). Под холодную картинку: 170, 200, 255; под красную: 255, 90, 70 */
  --fx-gold: 255, 222, 160;

  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  width: 100%;
  height: 100vh;
  min-height: 480px;
  background-color: var(--bg);
  overflow: hidden;
}

/* Слои: .bg (0) → затемнения ::before/::after (1) → .content (2) */
.main-block::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(to top, rgba(8, 9, 11, 0.63), rgba(102, 102, 102, 0));
}

.main-block::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  box-shadow: inset 0 -15px 150px 0 #08090b;
}

.content {
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  gap: 20px;
  padding: 10px 20px;
  text-align: center;
}

/* ---------- Анимированный фон ---------- */
.bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

/* Медленный "вдох" камеры: торжественно и слегка тревожно */
.bg-stage {
  position: absolute;
  inset: -4%;
  will-change: transform;
  animation: drift 40s ease-in-out infinite alternate;
}

.bg-layer {
  position: absolute;
  inset: 0;
  background-image: var(--hero-bg);
  background-size: cover;
  background-position: center;
}

@keyframes drift {
  from {
    transform: scale(1.03) translate3d(-1%, 0.6%, 0);
  }
  to {
    transform: scale(1.11) translate3d(1.2%, -1%, 0);
  }
}

/* Сбои реальности: полоски того же фона, чуть выцветшие и сдвинутые в бок (эффект преломления).
   Цвет не меняем: никаких hue-rotate и screen-наложения, только лёгкое обесцвечивание.
   Красный слой срабатывает каждые ~3.6 с, второй каждые ~5.3 с (циклы разные, поэтому иногда накладываются). */
.bg-glitch {
  opacity: 0;
  /* Выцветание: меньше насыщенности и контраста, чуть светлее */
  filter: saturate(0.72) contrast(0.88) brightness(1.1);
  will-change: transform, clip-path, opacity;
}

.bg-glitch--r {
  animation: glitchR 3.6s steps(1) infinite;
}

.bg-glitch--b {
  animation: glitchB 5.3s steps(1) infinite;
}

/* scaleX даёт лёгкое растяжение полоски: картинка как будто "гнётся" в стекле */
@keyframes glitchR {
  0%, 74%, 88%, 100% {
    opacity: 0;
  }
  74.5% {
    opacity: 0.92;
    clip-path: inset(18% 0 66% 0);
    transform: translateX(-22px) scaleX(1.015);
  }
  79% {
    opacity: 0.92;
    clip-path: inset(52% 0 30% 0);
    transform: translateX(16px) scaleX(1.012);
  }
  84% {
    opacity: 0.8;
    clip-path: inset(76% 0 8% 0);
    transform: translateX(-10px) scaleX(1.01);
  }
}

@keyframes glitchB {
  0%, 56%, 68%, 100% {
    opacity: 0;
  }
  56.3% {
    opacity: 0.9;
    clip-path: inset(34% 0 52% 0);
    transform: translateX(20px) scaleX(1.015);
  }
  61% {
    opacity: 0.9;
    clip-path: inset(8% 0 82% 0);
    transform: translateX(-14px) scaleX(1.012);
  }
  65% {
    opacity: 0.8;
    clip-path: inset(62% 0 24% 0);
    transform: translateX(12px) scaleX(1.01);
  }
}

/* ---------- Атмосфера ---------- */
.bg-fx {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 3s ease 0.8s;
}

.is-ready .bg-fx {
  opacity: 1;
}

/* Два прожектора из верхних углов: лучи идут по диагонали к центру и чуть покачиваются.
   Разброс (ширина луча) задаётся третьим числом в conic-gradient: сейчас 78°, направление центра луча: 125° слева, 235° справа */
.bg-beam {
  position: absolute;
  top: 0;
  width: 140%;
  height: 140%;
  mix-blend-mode: screen;
  opacity: 0;
  will-change: transform, opacity;
}

.bg-beam--l {
  left: 0;
  transform-origin: 0 0;
  background: conic-gradient(from 86deg at 0% 0%,
  transparent 0deg,
  rgba(var(--fx-gold), 0.38) 39deg,
  transparent 78deg,
  transparent 360deg);
  -webkit-mask-image: linear-gradient(135deg, #000 0%, transparent 70%);
  mask-image: linear-gradient(135deg, #000 0%, transparent 70%);
  animation: sweepL 21s ease-in-out infinite;
}

.bg-beam--r {
  right: 0;
  transform-origin: 100% 0;
  background: conic-gradient(from 196deg at 100% 0%,
  transparent 0deg,
  rgba(var(--fx-gold), 0.38) 39deg,
  transparent 78deg,
  transparent 360deg);
  -webkit-mask-image: linear-gradient(225deg, #000 0%, transparent 70%);
  mask-image: linear-gradient(225deg, #000 0%, transparent 70%);
  animation: sweepR 27s ease-in-out infinite;
}

/* Амплитуда качания: ±6° */
@keyframes sweepL {
  0%, 100% {
    transform: rotate(-6deg);
    opacity: 0;
  }
  18% {
    opacity: 0.5;
  }
  50% {
    transform: rotate(6deg);
    opacity: 0.65;
  }
  82% {
    opacity: 0.4;
  }
}

@keyframes sweepR {
  0%, 100% {
    transform: rotate(6deg);
    opacity: 0;
  }
  22% {
    opacity: 0.45;
  }
  55% {
    transform: rotate(-6deg);
    opacity: 0.6;
  }
  85% {
    opacity: 0.35;
  }
}

/* Линчевское "моргание" света: резкие неровные провалы в темноту, каждые несколько секунд */
.bg-flicker {
  position: absolute;
  inset: 0;
  background: #000;
  opacity: 0;
  animation: flicker 7s steps(1) infinite;
}

@keyframes flicker {
  0%, 100% {
    opacity: 0;
  }
  12% {
    opacity: 0.65;
  }
  12.4% {
    opacity: 0;
  }
  12.9% {
    opacity: 0.45;
  }
  13.6% {
    opacity: 0;
  }
  41% {
    opacity: 0.8;
  }
  41.3% {
    opacity: 0.1;
  }
  41.7% {
    opacity: 0.7;
  }
  42.1% {
    opacity: 0;
  }
  42.6% {
    opacity: 0.55;
  }
  43.4% {
    opacity: 0;
  }
  73% {
    opacity: 0.6;
  }
  73.4% {
    opacity: 0;
  }
  73.8% {
    opacity: 0.85;
  }
  74.8% {
    opacity: 0.2;
  }
  75.2% {
    opacity: 0.75;
  }
  76.2% {
    opacity: 0;
  }
}

/* Плёночное зерно */
.bg-grain {
  position: absolute;
  inset: -50%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .9 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity: 0.16;
  mix-blend-mode: overlay;
  animation: grain 0.9s steps(1) infinite;
}

@keyframes grain {
  0% {
    transform: translate(0, 0);
  }
  17% {
    transform: translate(-5%, 3%);
  }
  33% {
    transform: translate(3%, -6%);
  }
  50% {
    transform: translate(-4%, -2%);
  }
  67% {
    transform: translate(6%, 4%);
  }
  83% {
    transform: translate(-2%, 6%);
  }
}

/* ---------- Логотип ---------- */
.logo {
  position: relative;
  flex-shrink: 0;
  width: 600px;
  aspect-ratio: 3/1;
  max-width: 100%;
  overflow: hidden;

  opacity: 0;
  transform: scale(0.94) translateY(16px);
  filter: blur(8px);
  transition: opacity 1.2s ease 0.1s,
  transform 1.4s cubic-bezier(0.19, 1, 0.22, 1) 0.1s,
  filter 1.4s ease 0.1s;
}

.is-ready .logo {
  opacity: 1;
  transform: scale(1) translateY(0);
  filter: blur(0);
}

.logo img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  max-width: none;
}

/* ---------- Заголовок ---------- */
.title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(32px, 4vw, 80px);
  line-height: normal;
  color: var(--text);
  display: flex;
  flex-direction: column;
  gap: 0.1em;
}

.title-line {
  display: inline-block;
  opacity: 0;
  transform: translateY(20px);
  filter: blur(6px);
  transition: opacity 1s ease,
  transform 1s cubic-bezier(0.19, 1, 0.22, 1),
  filter 1s ease;
}

.is-ready .title-line {
  opacity: 1;
  transform: translateY(0);
  filter: blur(0);
}

.is-ready .title-line:nth-child(1) {
  transition-delay: 0.9s;
}

.is-ready .title-line:nth-child(2) {
  transition-delay: 1.2s;
}

/* ---------- CTA ---------- */
.cta-wrap {
  opacity: 0;
  transform: translateY(14px);
  transition: opacity 0.9s ease 1.7s,
  transform 0.9s cubic-bezier(0.19, 1, 0.22, 1) 1.7s;
}

.is-ready .cta-wrap {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .logo,
  .title-line,
  .cta-wrap {
    opacity: 1;
    transform: none;
    filter: none;
    transition: none;
  }

  /* Для тех, кому движение вредит: остаётся только статичная картинка */
  .bg-stage {
    animation: none;
  }

  .bg-glitch,
  .bg-fx {
    display: none;
  }
}
</style>