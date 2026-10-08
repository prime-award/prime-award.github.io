<script setup>

import {trackEvent} from "@/analytics/google.ts";

const props = defineProps({
  textImage: {type: String, required: true},
  logoImage: {type: String, required: true},
  href: {type: String, default: ''},
  // alt для картинки с названием бренда
  name: {type: String, default: ''},
  // высота картинки с названием, px
  textHeight: {type: Number, default: 20},
  // имя события GA4 (латиница, цифры, _), уникальное для каждого спонсора
  eventName: {type: String, default: ''},
})

function onClick() {
  if (!props.eventName) return

  trackEvent(props.eventName, {
    sponsor_name: props.name,
    link_url: props.href || undefined,
  })
}
</script>

<template>
  <component
      :is="href ? 'a' : 'div'"
      class="sponsor"
      :href="href || undefined"
      :target="href ? '_blank' : undefined"
      :rel="href ? 'noopener noreferrer' : undefined"
      @click="onClick"
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
  color: inherit;
  text-decoration: none;
  transition: box-shadow 0.2s ease;
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