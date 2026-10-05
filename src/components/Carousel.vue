<script setup lang="ts">
import {onMounted} from 'vue'
import {useStreamerCarousel} from "../composable/useStreamerCarousel.ts";
import CarouselCard from "./CarouselCard.vue";


const {streamers, shuffleStreamers} = useStreamerCarousel()

onMounted(shuffleStreamers)
</script>

<template>
  <section class="carousel" aria-label="Участники">
    <h2 class="heading">Кто станет королём рунета 2026?</h2>

    <div
        v-if="streamers.length"
        class="track"
        :style="{ '--count': streamers.length }"
    >
      <!-- Две одинаковые группы: сдвиг на -50% равен ширине ровно одной группы, поэтому стык незаметен -->
      <ul v-for="copy in 2" :key="copy" class="group">
        <li v-for="streamer in streamers" :key="streamer.nickname">
          <CarouselCard :streamer="streamer" :hidden="copy === 2"/>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.carousel {
  --gap: 12px;
  --seconds-per-card: 6s;

  overflow: hidden;
  margin-top: 20px;
  margin-bottom: 20px;
}

.heading {
  margin: 10px 0 20px 0;
  font-family: var(--font-display), serif;
  font-weight: 400;
  font-size: clamp(26px, 3vw, 54px);
  color: #fff;
  text-align: center;
}

.track {
  display: flex;
  width: max-content;
  /* margin, а не padding: он не входит в ширину, от которой считается -50% */
  margin-left: 30px;
  /* скорость не зависит от количества карточек */
  animation: scroll calc(var(--count) * var(--seconds-per-card)) linear infinite;
  will-change: transform;
}


.group {
  display: flex;
  flex-shrink: 0;
  gap: var(--gap);
  margin: 0;
  padding: 0 var(--gap) 0 0;
  list-style: none;
}

@keyframes scroll {
  to {
    transform: translateX(-50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .track {
    animation: none;
  }
}
</style>