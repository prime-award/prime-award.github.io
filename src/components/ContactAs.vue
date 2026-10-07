<script setup lang="ts">

import MainDivider from "../components/MainDivider.vue";
</script>

<template>
  <footer class="footer">
    <MainDivider/>

    <div class="footer__bar">
      <p class="footer__copy">PRIME 2026©</p>

      <a class="contact-link" href="https://t.me/nigeriam" target="_blank"
         rel="noopener noreferrer">
        <img class="contact-link__icon" src="@/assets/tg-icon.svg" alt="" aria-hidden="true"/>
        <span class="contact-link__text">связаться с авторами</span>
      </a>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  box-sizing: border-box;
  width: 100%;
  margin-top: auto; /* прижимает футер к низу, если родитель — flex-колонка */
  background: transparent;
}

.footer__bar {
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px 20px;
  padding: 15px 30px 30px;
  background: linear-gradient(180deg, #08090B 0%, #171a1f 100%);

  font-family: 'Palatino Linotype', Palatino, 'Book Antiqua', serif;
  font-size: 20px;
  font-weight: 400;
  font-style: normal;
  color: #687789;
}

.footer__copy {
  margin: 0;
  white-space: pre-wrap;
}

.contact-link {
  display: inline-flex;
  align-items: baseline; /* было: center */
  justify-content: center;
  gap: 5px;

  text-align: center;
  text-decoration-line: underline;
  text-transform: lowercase;
  line-height: 1;

  color: inherit;
  cursor: pointer;

  transition: opacity 0.2s ease;
}

.contact-link__icon {
  display: block;
  flex: none;
  width: 15px;
  height: 12px;
}

.contact-link__text {
  display: block;
}

@media (max-width: 600px) {
  .footer__bar {
    padding: 15px 16px 24px;
  }
}
</style>