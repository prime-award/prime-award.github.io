<script setup>
import primeLogo from '../assets/prime-logo.webp'
import SteamLvlUpLogo from './SteamLvlUpLogo.vue'
import AppLoader from './AppLoader.vue'
import {useMainBackground} from "../composable/useMainBlock.ts";
import {mediaUrl} from '../utils/media.ts'
import {useHeroVisibility} from '../composable/useHeroVisibility.ts'

const mainScreenVideo = mediaUrl('media/video/main-background.mp4')

defineProps({
  // строки заголовка под логотипом (каждая появляется своей анимацией)
  titleLines: {type: Array, default: () => ['Главная народная', 'премия ру-стриминга']},
})

const {videoRef, onRevealEnd, isEnded, isLoaded, isRevealStarted, onLoaderLeave} = useMainBackground()
const {heroRef} = useHeroVisibility()
</script>

<template>
  <!-- Пока видео не загрузилось — висит лоадер. Когда он исчез, is-revealing запускает вступительную анимацию -->
  <Transition name="loader-fade" @after-leave="onLoaderLeave">
    <div v-if="!isLoaded" class="main-screen__loader">
      <AppLoader/>
    </div>
  </Transition>

  <section ref="heroRef" class="main-screen" :class="{ 'is-revealing': isRevealStarted }">
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
        <span
            v-for="(line, index) in titleLines"
            :key="line"
            class="main-screen__title-line reveal"
            :style="{ '--reveal-index': index + 1 }"
        >{{ line }}</span>
      </h1>

      <div class="main-screen__actions reveal" style="--reveal-index: 3" @animationend="onRevealEnd">
        <slot name="actions"/>
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

/* макет: затемнение rgba(8,9,11,.63) сверху и снизу, прозрачное к середине */
.main-screen::before {
  pointer-events: none;
  background: linear-gradient(to bottom, rgba(8, 9, 11, 0.63) 0%, rgba(102, 102, 102, 0) 50%, rgba(8, 9, 11, 0.63) 100%);
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
  --flicker-duration: 12s;         /* длительность одного цикла */
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

  /* макет: логотип 986 px при ширине 1920 */
  width: clamp(300px, 51vw, 1000px);
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
  font-size: clamp(32px, 5vw, 96px);
  line-height: normal;
  color: var(--text);
}

.main-screen__title-line {
  display: inline-block;
}

.main-screen__loader {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg);
}

.loader-fade-leave-active {
  transition: opacity 0.1s ease;
}

.loader-fade-leave-to {
  opacity: 0;
}

/* До окончания загрузки элементы скрыты, анимация стартует только с классом is-revealing */
.reveal {
  --reveal-duration: 0.7s;
  --reveal-step: 0.3s;
  --reveal-start-delay: 0.1s;

  opacity: 0;
}

.main-screen.is-revealing .reveal {
  animation: reveal var(--reveal-duration) cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--reveal-start-delay) + var(--reveal-index, 0) * var(--reveal-step));
}

@keyframes reveal {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .reveal,
  .main-screen.is-revealing .reveal {
    opacity: 1;
    animation: none;
  }

  .loader-fade-leave-active {
    transition: none;
  }

  .main-screen__flicker.is-active {
    animation: none;
  }
}



</style>