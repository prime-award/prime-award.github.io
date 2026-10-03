<script setup>
import SponsorCard from './SponsorCard.vue'

import balconyLogo from '../assets/balcony-logo.png'
import balconyText from '../assets/balcony-text.svg'
import steamLogo from '../assets/steam-logo.png'
import steamText from '../assets/steamlvlup-text.png'
import geekLogo from '../assets/geek-logo.png'
import geekText from '../assets/geek-text.svg'
</script>

<template>
  <section class="sponsors">
    <h2 class="heading">При поддержкЕ</h2>
    <ul class="brands">
      <li>
        <SponsorCard
            name="balcony"
            :logo-image="balconyLogo"
            :text-image="balconyText"
            :text-height="23"
            href="https://balcony.su/"
        />
      </li>
      <li>
        <SponsorCard
            name="steamlvlup"
            :logo-image="steamLogo"
            :text-image="steamText"
            :text-height="19"
            href="https://steamlvlup.com/"
        />
      </li>
      <li>
        <SponsorCard
            name="Гик новости"
            :logo-image="geekLogo"
            :text-image="geekText"
            :text-height="18"
            href="https://t.me/qulyaba"
        />
      </li>
    </ul>
  </section>
</template>

<style scoped>
.sponsors {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.heading {
  font-family: var(--font-display), serif;
  font-weight: 400;
  font-size: clamp(26px, 2.1vw, 40px);
  color: #fff;
  text-align: center;
  margin-top: 24px;
  margin-bottom: 6px;
}

.brands {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  width: 100%;
  margin: 0;
  padding: 5px 5px 15px;
  list-style: none;
}
</style>