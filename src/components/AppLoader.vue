<script setup>
import loadingImg from '@/assets/loading.webp'
</script>

<template>
  <div class="loader" role="status" aria-live="polite" aria-label="Загрузка">
    <img class="loader__img" :src="loadingImg" alt="" aria-hidden="true" draggable="false" />
  </div>
</template>

<style scoped>
.loader {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
}

.loader__img {
  width: 16vh;
  height: 16vh;
  object-fit: contain;
  user-select: none;
  animation: loader-spin 3s linear infinite;
}

@keyframes loader-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .loader__img {
    animation-duration: 3s;
  }
}
</style>