<script setup>
import CarouselCard from './CarouselCard.vue'

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
    <h2 class="heading">Кто,<br/>если<br/>не мы?</h2>
    <div class="track">
      <template v-for="copy in 2" :key="copy">
        <CarouselCard
            v-for="(src, i) in cards"
            :key="i"
            :src="src"
            :hidden="copy === 2"
        />
      </template>
    </div>
  </section>
</template>

<style scoped>
.carousel {
  overflow: hidden;
  margin-top: 20px;
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
  display: flex;
  gap: 12px;
  width: max-content;
  padding-left: 30px;
  animation: scroll 60s linear infinite;
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
</style>