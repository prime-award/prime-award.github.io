<script setup>
import MainBlock from './components/MainBlock.vue'
import CardsCarousel from './components/CardsCarousel.vue'
import SponsorsSection from './components/SponsorsSection.vue'
</script>

<template>
  <main>
    <MainBlock/>
    <CardsCarousel/>
    <h2 class="heading">Отборочный этап:<br/>03.10.26 - 23.10.26</h2>
    <SponsorsSection/>
  </main>
</template>

<style scoped>
.heading {
  padding: 20px;
  font-family: var(--font-display), serif;
  font-weight: 400;
  font-size: clamp(26px, 2.1vw, 40px);
  color: #fff;
  text-align: center;
  opacity: 0.4;
  background: rgba(40, 40, 40, 0.2);
}

</style>
