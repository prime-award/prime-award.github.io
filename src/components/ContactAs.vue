<script setup>
</script>


<template>
  <div class="contact-wrapper">
    <a class="contact-link" href="https://t.me/nigeriam" target="_blank"
       rel="noopener noreferrer">
      <img class="contact-link__icon" src="@/assets/tg-icon.svg" alt="" aria-hidden="true"/>

      <span class="contact-link__text">связаться с авторами</span>
    </a>
  </div>
</template>

<style scoped>
.contact-wrapper {
  box-sizing: border-box;
  display: flex;
  justify-content: flex-end; /* текст прижат к правому краю */
  align-items: center;
  width: 100%; /* на всю ширину блока */
  margin-top: auto; /* прижимает wrapper к низу, если родитель — flex-колонка */
  padding-right: 32px; /* отступ от правого края */
}

.contact-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px; /* расстояние между иконкой и текстом */

  font-family: 'Palatino Linotype', Palatino, 'Book Antiqua', serif;
  font-style: normal;
  font-weight: 400;
  font-size: 20px;
  text-align: center;
  text-decoration-line: underline;
  text-transform: lowercase;

  color: rgba(229, 231, 234, 0.5);
  cursor: pointer;
  transition: color 0.2s ease;
}

.contact-link:hover,
.contact-link:focus-visible {
  color: rgba(229, 231, 234, 0.85);
}

.contact-link__icon {
  flex: none; /* иконка не сжимается */
  width: 16px;
  height: 16px;
}

.contact-link__text {
  flex: none;
}
</style>