<script setup>
import balconyLogo from '../assets/balcony-logo.png'
import balconyText from '../assets/balcony-text.svg'
import steamLogo from '../assets/steam-logo.png'
import steamText from '../assets/steamlvlup-text.png'
import geekLogo from '../assets/geek-logo.png'
import geekText from '../assets/geek-text.svg'

// Названия брендов — картинки, шрифты Inter / 8bit в проект не нужны
const brands = [
  { name: 'balcony', logo: balconyLogo, text: balconyText, h: 23 },
  { name: 'steamlvlup', logo: steamLogo, text: steamText, h: 19 },
  { name: 'Гик новости', logo: geekLogo, text: geekText, h: 18 },
]
</script>

<template>
  <section class="sponsors">
    <h2 class="heading">При поддержкЕ</h2>
    <ul class="brands">
      <li v-for="b in brands" :key="b.name" class="brand">
        <img class="logo" :src="b.logo" alt="" width="36" height="36" />
        <img class="text" :src="b.text" :alt="b.name" :style="{ height: b.h + 'px' }" />
      </li>
    </ul>
  </section>
</template>

<style scoped>
.sponsors { display: flex; flex-direction: column; align-items: center; gap: 15px; padding: 10px 20px 30px; background: var(--bg); }
.heading { margin: 0; font-family: var(--font-display); font-weight: 400; font-size: clamp(26px, 2.1vw, 40px); color: #fff; text-align: center; }
.brands { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 20px 30px; width: 100%; max-width: 1014px; margin: 0; padding: 5px 5px 15px; list-style: none; }
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  border-radius: 15px;
  background: linear-gradient(180deg, rgba(99, 112, 133, 0.3), rgba(23, 26, 31, 0.5));
}
.logo { width: 36px; height: 36px; object-fit: cover; }
.text { width: auto; }
@media (max-width: 700px) { .brands { justify-content: center; } }
</style>
