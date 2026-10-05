<script setup lang="ts">
import type {Streamer} from '../types/streamer.ts'

defineProps<{
  streamer: Streamer
  hidden?: boolean
}>()
</script>

<template>
  <a
      class="card"
      :href="streamer.twitchLink"
      target="_blank"
      rel="noopener noreferrer"
      :aria-label="streamer.nickname"
      :aria-hidden="hidden"
      :tabindex="hidden ? -1 : 0"
  >
    <img :src="streamer.avatar" alt="" loading="lazy" draggable="false"/>
  </a>
</template>

<style scoped>
.card {
  position: relative;
  display: block;
  flex: none;
  width: 280px;
  height: 340px;
  border-radius: 20px;
  overflow: hidden;
  background: radial-gradient(circle, #687789 0%, #08090B 100%);
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.card:hover,
.card:focus-visible {
  opacity: 1;
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
  pointer-events: none;
}

@media (max-width: 600px) {
  .card {
    width: 200px;
    height: 243px;
  }
}
</style>