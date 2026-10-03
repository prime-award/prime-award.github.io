<script setup>
import heroBg from '../assets/hero-bg.png'
import primeLogo from '../assets/prime-logo.png'

// Искры: псевдослучайные, но детерминированные (без расхождений при SSR)
const embers = Array.from({length: 22}, (_, i) => {
  const r = (n) => {
    const x = Math.sin(i * 97.13 + n * 41.7) * 10000
    return x - Math.floor(x)
  }
  return {
    left: `${(r(1) * 100).toFixed(1)}%`,
    size: `${(2 + r(2) * 4).toFixed(1)}px`,
    dur: `${(7 + r(3) * 8).toFixed(1)}s`,
    delay: `${(-r(4) * 15).toFixed(1)}s`,
    drift: `${((r(5) - 0.5) * 120).toFixed(0)}px`,
  }
})
</script>

<template>
  <!-- «первая страница»: ровно на весь экран -->
  <section class="main-block" :style="{ backgroundImage: `url(${heroBg})` }">
    <!-- свечение и искры -->
    <div class="glow glow--floor" aria-hidden="true"></div>
    <div class="glow glow--halo" aria-hidden="true"></div>
    <div class="embers" aria-hidden="true">
      <span
          v-for="(e, i) in embers"
          :key="i"
          class="ember"
          :style="{
          left: e.left,
          width: e.size,
          height: e.size,
          animationDuration: e.dur,
          animationDelay: e.delay,
          '--drift': e.drift,
        }"
      ></span>
    </div>

    <div class="content">
      <div class="logo" role="img" aria-label="PRIME">
        <img :src="primeLogo" alt=""/>
      </div>
      <h1 class="title">Кто станет<br/>королём рунета 2026?</h1>
      <a class="button" href="#apply">
        <span class="button__label">Участвовать в отборе</span>
      </a>
    </div>
  </section>
</template>

<style scoped>
.main-block {
  --orange: #ff7a1a;
  --orange-hot: #ff9a3c;
  --orange-deep: #e8590c;

  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  width: 100%;
  height: 100vh;
  min-height: 480px;
  background-color: var(--bg);
  background-size: cover;
  background-position: center;
  overflow: hidden;
}

.main-block::before { /* затемнение снизу */
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(8, 9, 11, 0.63), rgba(102, 102, 102, 0));
}

.main-block::after { /* внутренняя тень */
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  box-shadow: inset 0 -15px 150px 0 #08090b;
}

/* ---------- Свечение ---------- */
.glow {
  position: absolute;
  pointer-events: none;
  mix-blend-mode: screen;
}

/* тёплое зарево, поднимающееся снизу */
.glow--floor {
  left: 50%;
  bottom: -25%;
  width: 120%;
  height: 80%;
  transform: translateX(-50%);
  background: radial-gradient(
      ellipse at 50% 100%,
      rgba(255, 122, 26, 0.55) 0%,
      rgba(232, 89, 12, 0.28) 35%,
      rgba(232, 89, 12, 0) 70%
  );
  animation: breathe 6s ease-in-out infinite;
}

/* мягкий ореол за логотипом и заголовком */
.glow--halo {
  top: 8%;
  left: 50%;
  width: min(1100px, 90vw);
  aspect-ratio: 1.6 / 1;
  transform: translateX(-50%);
  background: radial-gradient(
      closest-side,
      rgba(255, 154, 60, 0.28),
      rgba(255, 122, 26, 0.12) 55%,
      rgba(255, 122, 26, 0) 100%
  );
  filter: blur(30px);
  animation: breathe 8s ease-in-out infinite reverse;
}

@keyframes breathe {
  0%, 100% {
    opacity: 0.65;
    transform: translateX(-50%) scale(1);
  }
  50% {
    opacity: 1;
    transform: translateX(-50%) scale(1.08);
  }
}

/* ---------- Искры ---------- */
.embers {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.ember {
  position: absolute;
  bottom: -10px;
  border-radius: 50%;
  background: radial-gradient(circle, #fff3dc 0%, var(--orange-hot) 45%, var(--orange) 100%);
  box-shadow: 0 0 8px 2px rgba(255, 122, 26, 0.8);
  opacity: 0;
  animation-name: rise;
  animation-timing-function: ease-out;
  animation-iteration-count: infinite;
}

@keyframes rise {
  0% {
    transform: translate3d(0, 0, 0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  100% {
    transform: translate3d(var(--drift), -85vh, 0) scale(0.4);
    opacity: 0;
  }
}

/* ---------- Контент ---------- */
.content {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  gap: 20px;
  padding: 10px 20px;
  text-align: center;
}

.logo { /* размер из Figma: 986×342 (node 39:344) */
  position: relative;
  flex-shrink: 0;
  width: 600px;
  aspect-ratio: 3/1;
  max-width: 100%;
  overflow: hidden;
}

.logo img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  max-width: none;
}

.title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(32px, 4vw, 86px);
  line-height: normal;
  color: var(--text);
  text-shadow: 0 0 40px rgba(255, 122, 26, 0.35);
}

/* ---------- Кнопка ---------- */
.button {
  position: relative;
  display: inline-block;
  overflow: hidden;
  isolation: isolate;
  padding: 15px 30px;
  border-radius: 25px;
  background: var(--text);
  color: var(--bg);
  font-family: var(--font-display);
  font-size: clamp(22px, 2.5vw, 48px);
  text-decoration: none;
  box-shadow: 0 0 0 0 rgba(255, 122, 26, 0.6),
  0 6px 30px rgba(255, 122, 26, 0.45);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.button__label {
  position: relative;
  z-index: 1;
}

/* бегущий оранжевый блик */
.button::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 60%;
  z-index: 0;
  background: linear-gradient(
      105deg,
      rgba(255, 122, 26, 0) 0%,
      rgba(255, 154, 60, 0.65) 50%,
      rgba(255, 122, 26, 0) 100%
  );
  transform: translateX(-130%) skewX(-20deg);
}


.button:hover {
  transform: translateY(-3px) scale(1.04);
  box-shadow: 0 0 0 0 rgba(255, 122, 26, 0.6),
  0 10px 50px rgba(255, 122, 26, 0.75);
}

.button:hover::after {
  opacity: 1;
}

.button:active {
  transform: translateY(0) scale(0.98);
}

.button:focus-visible {
  outline: 3px solid var(--orange-hot);
  outline-offset: 4px;
}


/* уважаем настройку «уменьшить анимацию» */
@media (prefers-reduced-motion: reduce) {
  .glow,
  .ember,
  .button,
  .button::before {
    animation: none;
  }

  .ember {
    display: none;
  }
}
</style>