<script setup>
import heroBg from '../assets/hero-bg.png'
import primeLogo from '../assets/prime-logo.png'
</script>

<template>
  <!-- «первая страница»: ровно на весь экран -->
  <section class="first-screen" :style="{ backgroundImage: `url(${heroBg})` }">
    <div class="content">
      <div class="logo" role="img" aria-label="PRIME">
        <img :src="primeLogo" alt="" />
      </div>
      <h1 class="title">Кто станет<br />королём рунета 2026?</h1>
      <a class="button" href="#apply">Участвовать в отборе</a>
    </div>
  </section>
</template>

<style scoped>
.first-screen {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  min-height: 560px;
  background-color: var(--bg);
  background-size: cover;
  background-position: center;
}
.first-screen::before { /* затемнение снизу */
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(8, 9, 11, 0.63), rgba(102, 102, 102, 0));
}
.first-screen::after { /* внутренняя тень */
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  box-shadow: inset 0 -15px 150px 0 #08090b;
}
.content {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  gap: 20px;
  padding: 50px 20px;
  text-align: center;
}
.logo {
  position: relative;
  width: min(986px, 80vw);
  max-height: 32vh;
  aspect-ratio: 986 / 342;
  overflow: hidden;
}
.logo img { position: absolute; top: 0; left: 0; width: 100%; height: 188.76%; max-width: none; }
.title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(32px, 5vw, 96px);
  line-height: normal;
  color: var(--text);
}
.button {
  padding: 15px 30px;
  border-radius: 25px;
  background: var(--text);
  color: var(--bg);
  font-family: var(--font-display);
  font-size: clamp(22px, 2.5vw, 48px);
  text-decoration: none;
  transition: transform 0.2s, opacity 0.2s;
}
.button:hover { opacity: 0.9; transform: translateY(-2px); }
</style>
