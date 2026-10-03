<script setup>
defineProps({
  textImage: {type: String, required: true},
  logoImage: {type: String, required: true},
  href: {type: String, default: ''},
  // alt для картинки с названием бренда
  name: {type: String, default: ''},
  // высота картинки с названием, px
  textHeight: {type: Number, default: 20},
})
</script>

<template>
  <component
      :is="href ? 'a' : 'div'"
      class="sponsor"
      :href="href || undefined"
      :target="href ? '_blank' : undefined"
      :rel="href ? 'noopener noreferrer' : undefined"
  >
    <img class="logo" :src="logoImage" alt="" width="36" height="36"/>
    <img class="text" :src="textImage" :alt="name" :style="{ height: textHeight + 'px' }"/>
  </component>
</template>

<style scoped>
.sponsor {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  border-radius: 15px;
  background: linear-gradient(180deg, rgba(99, 112, 133, 0.3), rgba(23, 26, 31, 0.5));
  color: inherit;
  text-decoration: none;
  transition: box-shadow 0.2s ease;
}

/* Белая подсветка — только у кликабельных карточек (с href) */
a.sponsor:hover,
a.sponsor:focus-visible {
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.2), 0 0 4px rgba(255, 255, 255, 0.3);
  outline: none;
}

.logo {
  width: 36px;
  height: 36px;
  object-fit: cover;
}

.text {
  width: auto;
}
</style>