<script setup>
import heroBg from '../assets/hero-bg.png'
import primeLogo from '../assets/prime-logo.png'
import MainButton from "./MainButton.vue";
</script>

<template>
  <section class="main-block" :style="{ backgroundImage: `url(${heroBg})` }">
    <div class="content">
      <div class="logo" role="img" aria-label="PRIME">
        <img :src="primeLogo" alt=""/>
      </div>
      <h1 class="title">Кто станет<br/>королём рунета 2026?</h1>
      <MainButton href="#apply">Участвовать в отборе</MainButton>
    </div>
  </section>
</template>

<style scoped>
.main-block {
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
  font-size: clamp(32px, 3vw, 80px);
  line-height: normal;
  color: var(--text);
}
</style>