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
  gap: var(--space-2) var(--space-5);
  padding: var(--space-4) var(--layout-margin) var(--space-6);
  background: linear-gradient(180deg, var(--bg) 0%, var(--surface-2) 100%);
  font: 400 var(--type-body-l) var(--font-text);
  color: var(--muted);
}

.footer__copy {
  margin: 0;
  white-space: pre-wrap;
}

/* ссылка: зона нажатия 48dp по высоте */
.contact-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: var(--touch-target);
  text-align: center;
  text-decoration-line: underline;
  text-transform: lowercase;
  color: inherit;
  cursor: pointer;
  transition: color 0.2s ease;
}

.contact-link:hover {
  color: var(--text);
}

.contact-link__icon {
  display: block;
  flex: none;
  width: var(--space-4);
  height: auto;
}

.contact-link__text {
  display: block;
}
</style>
