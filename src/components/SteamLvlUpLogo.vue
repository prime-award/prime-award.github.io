<script setup>
import logo from '@/assets/steamlvlup-logo.png'

defineProps({
  // hero — крупный на главном экране, header — по высоте шапки
  variant: {type: String, default: 'hero'},
})
</script>

<template>
  <a
      href="https://slvlup.com/r/prime?utm_source=prime&utm_medium=web"
      target="_blank"
      rel="noopener noreferrer"
      class="logo-link"
      :class="`logo-link--${variant}`"
  >
    <img :src="logo" alt="SteamLvlUp"/>
  </a>
</template>

<style scoped>
.logo-link {
  display: inline-block;
  line-height: 0;
}

.logo-link img {
  display: block;
  object-fit: contain;
}

.logo-link--hero img {
  width: clamp(200px, 8vw, 400px);
}

/* в шапке: по высоте, ширина — по пропорциям картинки */
.logo-link--header img {
  width: auto;
  height: var(--space-8);
}

@media (max-width: 599px) {
  .logo-link--header img {
    height: var(--space-6);
  }
}
</style>
