<script setup>
defineProps({
  src: { type: String, required: true },
  hidden: { type: Boolean, default: false },
})
</script>

<template>
  <div class="card" :aria-hidden="hidden">
    <img :src="src" alt="" loading="lazy" />
  </div>
</template>

<style scoped>
.card {
  position: relative;
  flex: none;
  width: 281px;
  height: 341px;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(104, 119, 137, 0.5), rgba(8, 9, 11, 0.5));
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.card:hover {
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