<script setup>
import p1 from '../assets/person-1.png'
import p2 from '../assets/person-2.png'
import p3 from '../assets/person-3.png'
import p4 from '../assets/person-4.png'

const base = [p1, p2, p3, p4]
const cards = [...base, ...base] // 8 карточек, как в макете
</script>

<template>
  <section class="carousel" aria-label="Участники">
    <div class="track">
      <!-- список дважды для бесшовной прокрутки -->
      <template v-for="copy in 2" :key="copy">
        <div v-for="(src, i) in cards" :key="i" class="card" :aria-hidden="copy === 2">
          <img :src="src" alt="" loading="lazy" />
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.carousel { overflow: hidden; padding: 21px 0; opacity: 0.5; }
.track { display: flex; gap: 30px; width: max-content; padding-left: 30px; animation: scroll 60s linear infinite; }
.card {
  position: relative;
  flex: none;
  width: 281px;
  height: 341px;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(104, 119, 137, 0.5), rgba(8, 9, 11, 0.5));
}
.card img { width: 100%; height: 100%; object-fit: cover; object-position: top; }
.card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: inset 0 6px 60px rgba(0, 0, 0, 0.7);
}
@keyframes scroll { to { transform: translateX(calc(-50% - 15px)); } }
@media (prefers-reduced-motion: reduce) { .track { animation: none; } }
@media (max-width: 600px) { .card { width: 200px; height: 243px; } }
</style>
