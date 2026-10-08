<script setup>
import MainBlock from '../components/MainBlock.vue'
import Carousel from '../components/Carousel.vue'
import SponsorsSection from '../components/SponsorsSection.vue'
import ContactAs from '../components/ContactAs.vue'
import DateBlock from "@/components/DateBlock.vue";
import {useHead} from "@unhead/vue";

useHead({
  title: 'PRIME 2026 - Народная премия ру-стриминга',
  meta: [
    {
      name: 'description',
      content: 'Главная народная премия ру-стриминга. Ежегодно подведём итоги, увидим борьбу легенд русскоязычного стриминга с платформ Twitch, Kick и VK Live.'
    },
  ],
  link: [
    {rel: 'canonical', href: 'https://prime-award.ru/'},
  ],
})

</script>

<template>
  <main>
    <MainBlock/>
    <Carousel/>
    <DateBlock/>
    <SponsorsSection/>
    <ContactAs/>
  </main>
</template>

<style scoped>

</style>
