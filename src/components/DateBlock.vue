<script setup lang="ts">
</script>
<template>
  <section class="date">
    <h2 class="date__text">Отборочный этап:<br/>23 октября - 20 ноября</h2>
  </section>
</template>

<style scoped>
.date {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 30px;
  background: linear-gradient(
      rgba(104, 119, 137, 0.05) 0%,
      transparent 40%,
      transparent 60%,
      rgba(104, 119, 137, 0.05) 100%
  );
}

.date__text {
  margin: 0;
  font-family: var(--font-display), serif;
  font-weight: 400;
  /* макет 1920px: 64px */
  font-size: clamp(26px, 3vw, 54px);
  color: rgba(229, 231, 234, 0.7);
  text-align: center;
}
</style>