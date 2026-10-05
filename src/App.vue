<script setup>
import MainBlock from './components/MainBlock.vue'
import Carousel from './components/Carousel.vue'
import SponsorsSection from './components/SponsorsSection.vue'
import ContactAs from "./components/ContactAs.vue";
</script>

<template>
  <main>
    <MainBlock/>
    <Carousel/>
    <h2 class="heading">Отборочный этап:<br/>08.10.26 - 23.10.26</h2>
    <SponsorsSection/>
    <ContactAs/>
  </main>
</template>

<style scoped>
.heading {
  padding: 60px;
  font-family: var(--font-display), serif;
  font-weight: 400;
  font-size: clamp(26px, 2vw, 40px);
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  background: #0F0F0F;
}

</style>
