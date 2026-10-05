<script setup>
import mainScreenVideo from '../assets/main-background.mp4'
import primeLogo from '../assets/prime-logo.png'
import MainButton from './MainButton.vue'
import SteamLvlUpLogo from './SteamLvlUpLogo.vue'
import {useMainBackground} from "../composable/useMainBlock.ts";


const {videoRef, onRevealEnd, isEnded} = useMainBackground()
</script>

<template>
  <section class="main-screen">
    <video
        ref="videoRef"
        class="main-screen__background"
        :src="`${mainScreenVideo}#t=0.001`"
        muted
        playsinline
        preload="auto"
        disablepictureinpicture
        aria-hidden="true"
    ></video>

    <!-- Мерцание поверх последнего кадра: запускается, когда видео доиграло до конца, и идёт циклом -->
    <div
        class="main-screen__flicker"
        :class="{ 'is-active': isEnded }"
        aria-hidden="true"
    ></div>

    <div class="main-screen__top reveal" style="--reveal-index: 4">
      <SteamLvlUpLogo :height="40"/>
    </div>

    <div class="main-screen__content">
      <div
          class="main-screen__logo reveal"
          style="--reveal-index: 0"
          role="img"
          aria-label="PRIME"
      >
        <img class="main-screen__logo-image" :src="primeLogo" alt=""/>
      </div>

      <h1 class="main-screen__title">
        <span class="main-screen__title-line reveal" style="--reveal-index: 1">Главная народная</span>
        <span class="main-screen__title-line reveal" style="--reveal-index: 2">премия ру-стриминга</span>
      </h1>

      <div class="main-screen__actions reveal" style="--reveal-index: 3" @animationend="onRevealEnd">
        <MainButton href="#apply">Участвовать в отборе</MainButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.main-screen {
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

.main-screen::before,
.main-screen::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
}



.main-screen::after {
  pointer-events: none;
  background: linear-gradient(to top, var(--bg) 0%, transparent 60%, transparent 100%);
}

.main-screen__background {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  pointer-events: none;
}


.main-screen__flicker {
  --flicker-color: #000;          /* цвет затемняющего слоя */
  --flicker-intensity: 1;         /* множитель силы вспышек: 0 — нет эффекта, 0.5 — вдвое слабее */
  --flicker-duration: 9s;         /* длительность одного цикла */
  --flicker-delay: 0s;            /* пауза между окончанием видео и первым циклом */
  --flicker-iterations: infinite; /* число повторов: infinite или число */

  position: absolute;
  inset: 0;
  z-index: 0;
  background: var(--flicker-color);
  opacity: 0;
  pointer-events: none;
}

.main-screen__flicker.is-active {
  will-change: opacity;
  animation: flicker var(--flicker-duration) steps(1) var(--flicker-delay) var(--flicker-iterations);
}

@keyframes flicker {
  0%, 100% { opacity: 0; }
  12%   { opacity: calc(0.65 * var(--flicker-intensity)); }
  12.4% { opacity: 0; }
  12.9% { opacity: calc(0.45 * var(--flicker-intensity)); }
  13.6% { opacity: 0; }
  41%   { opacity: calc(0.8 * var(--flicker-intensity)); }
  41.3% { opacity: calc(0.1 * var(--flicker-intensity)); }
  41.7% { opacity: calc(0.7 * var(--flicker-intensity)); }
  42.1% { opacity: 0; }
  42.6% { opacity: calc(0.55 * var(--flicker-intensity)); }
  43.4% { opacity: 0; }
  73%   { opacity: calc(0.6 * var(--flicker-intensity)); }
  73.4% { opacity: 0; }
  73.8% { opacity: calc(0.85 * var(--flicker-intensity)); }
  74.8% { opacity: calc(0.2 * var(--flicker-intensity)); }
  75.2% { opacity: calc(0.75 * var(--flicker-intensity)); }
  76.2% { opacity: 0; }
}

.main-screen__top {
  position: relative;
  z-index: 2;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  padding: 24px 20px 0;
}

.main-screen__content {
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

.main-screen__logo {
  position: relative;
  flex-shrink: 0;
  width: 600px;
  aspect-ratio: 3 / 1;
  max-width: 100%;
  overflow: hidden;
}

.main-screen__logo-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  max-width: none;
}

.main-screen__title {
  display: flex;
  flex-direction: column;
  gap: 0.1em;
  margin: 0;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(32px, 4vw, 80px);
  line-height: normal;
  color: var(--text);
}

.main-screen__title-line {
  display: inline-block;
}

.reveal {
  --reveal-duration: 0.7s;
  --reveal-step: 0.3s;
  --reveal-start-delay: 0.1s;

  animation: reveal var(--reveal-duration) cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--reveal-start-delay) + var(--reveal-index, 0) * var(--reveal-step));
}

@keyframes reveal {
  from {
    opacity: 0;
    transform: translateY(32px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .reveal {
    animation: none;
  }

  .main-screen__flicker.is-active {
    animation: none;
  }
}



</style>