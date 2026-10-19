<script setup>
import SponsorButton from './SponsorButton.vue'

import balconyLogo from '../assets/balcony-logo.png'
import balconyText from '../assets/balcony-text.png'
import steamLogo from '../assets/steamlvlup-icon.png'
import steamText from '../assets/steamlvlup-text.png'
import geekLogo from '../assets/geek-logo.png'
import geekText from '../assets/geek-text.png'
</script>

<template>
  <section class="sponsors">
    <h2 class="heading">При поддержкЕ</h2>
    <ul class="brands">
      <li>
        <SponsorButton
            name="balcony"
            event-name="sponsor_click_balcony"
            :logo-image="balconyLogo"
            :text-image="balconyText"
            :text-height="30"
            href="https://balcony.su/"
        />
      </li>
      <li>
        <SponsorButton
            name="steamlvlup"
            event-name="sponsor_click_steamlvlup"
            :logo-image="steamLogo"
            :text-image="steamText"
            :text-height="19"
            href="https://slvlup.com/r/prime?utm_source=prime&utm_medium=web"
        />
      </li>
      <li>
        <SponsorButton
            name="Гик новости"
            event-name="sponsor_click_geek_news"
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
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 0 0 var(--space-5);
  padding: 0 var(--layout-margin);
  background: var(--bg);
}

.heading {
  margin: var(--space-4) 0 var(--space-2);
  font: 400 var(--type-headline-s) var(--font-display);
  color: var(--text);
  text-align: center;
}

/* compact: спонсоры друг под другом */
.brands {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* expanded+: в ряд, средний по центру */
@media (min-width: 840px) {
  .brands {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    column-gap: var(--space-12);
  }

  .brands li:nth-child(1) {
    justify-self: end;
  }

  .brands li:nth-child(2) {
    justify-self: center;
  }

  .brands li:nth-child(3) {
    justify-self: start;
  }
}
</style>
