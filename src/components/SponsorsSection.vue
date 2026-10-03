<script setup>
import SponsorButton from './SponsorButton.vue'

import balconyLogo from '../assets/balcony-logo.png'
import balconyText from '../assets/balcony-text.svg'
import steamLogo from '../assets/steam-logo.png'
import steamText from '../assets/steamlvlup-text.png'
import geekLogo from '../assets/geek-logo.png'
import geekText from '../assets/geek-text.svg'
</script>

<template>
  <section class="sponsors">
    <h2 class="heading">Спонсоры</h2>
    <ul class="brands">
      <li>
        <SponsorButton
            name="balcony"
            :logo-image="balconyLogo"
            :text-image="balconyText"
            :text-height="23"
            href="https://balcony.su/"
        />
      </li>
      <li>
        <SponsorButton
            name="steamlvlup"
            :logo-image="steamLogo"
            :text-image="steamText"
            :text-height="19"
            href="https://steamlvlup.com/"
        />
      </li>
      <li>
        <SponsorButton
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
  margin-top: 0;
  margin-bottom: 6px;
}

.brands {
  /* боковые колонки равной ширины (1fr) — центральная всегда ровно по центру */
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  column-gap: 20px;
  width: 100%;
  margin: 0;
  padding: 5px 5px 15px;
  list-style: none;
}

/* левый прижат к центральному справа, правый — слева */
.brands li:nth-child(1) {
  justify-self: end;
}

.brands li:nth-child(2) {
  justify-self: center;
}

.brands li:nth-child(3) {
  justify-self: start;
}

/* на узких экранах трёх в ряд не помещается — возвращаем перенос */
@media (max-width: 720px) {
  .brands {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 20px;
  }
}
</style>