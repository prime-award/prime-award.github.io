<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref} from 'vue'
import type {Streamer} from '../types/streamer.ts'
import {injectLazyImages} from "../composable/useLazyImages.ts";


const props = defineProps<{
  streamer: Streamer
  hidden?: boolean
}>()

const lazy = injectLazyImages()
const card = ref<HTMLElement | null>(null)
const imageReady = ref(false)

// src появляется только когда карточка подошла к видимой области
const src = computed(() => (lazy.isLoaded(props.streamer.avatar) ? props.streamer.avatar : undefined))

onMounted(() => {
  if (card.value) lazy.observe(card.value, props.streamer.avatar)
})

onBeforeUnmount(() => {
  if (card.value) lazy.unobserve(card.value)
})
</script>

<template>
  <a
      ref="card"
      class="card"
      :href="streamer.twitchLink"
      target="_blank"
      rel="noopener noreferrer"
      :aria-label="streamer.nickname"
      :aria-hidden="hidden"
      :tabindex="hidden ? -1 : 0"
  >
    <img
        :src="src"
        :class="{ ready: imageReady }"
        alt=""
        decoding="async"
        draggable="false"
        @load="imageReady = true"
    />
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
  /* пока картинка не пришла, виден градиент карточки */
  opacity: 0;
  transition: opacity 0.4s ease;
}

.card img.ready {
  opacity: 1;
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