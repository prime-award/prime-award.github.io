
<script setup>
import p1 from '../assets/аравудуспнг.png'
import p2 from '../assets/арчидоспнг.png'
import p3 from '../assets/ласкапнг.png'
import p4 from '../assets/лизонпнг.png'
import p5 from '../assets/мелхарукоспнг.png'
import p6 from '../assets/мэддисонпнг.png'
import p7 from '../assets/сегаллпнг.png'

const cards = [p1, p2, p3, p4, p5, p6, p7]
</script>

<template>
  <section class="carousel" aria-label="Участники">
    <h2 class="heading">Кто, если не мы?</h2>
    <div class="track">
      <template v-for="copy in 2" :key="copy">
        <div v-for="(src, i) in cards" :key="i" class="card" :aria-hidden="copy === 2">
          <img :src="src" alt="" loading="lazy"/>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.carousel {
  overflow: hidden;
  margin-top: 40px;
  margin-bottom: 20px;
}


.heading {
  margin: 0;
  font-family: var(--font-display), serif;
  font-weight: 400;
  font-size: clamp(26px, 2.1vw, 40px);
  color: #fff;
  text-align: center;
}

.track {
  opacity: 0.5;
  display: flex;
  gap: 12px;
  width: max-content;
  padding-left: 30px;
  animation: scroll 60s linear infinite;
}

.card {
  position: relative;
  flex: none;
  width: 281px;
  height: 341px;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(104, 119, 137, 0.5), rgba(8, 9, 11, 0.5));
}

.card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
}

.card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: inset 0 6px 60px rgba(0, 0, 0, 0.7);
}

@keyframes scroll {
  to {
    transform: translateX(calc(-50% - 15px));
  }
}

@media (prefers-reduced-motion: reduce) {
  .track {
    animation: none;
  }
}

@media (max-width: 600px) {
  .card {
    width: 200px;
    height: 243px;
  }
}
</style>
