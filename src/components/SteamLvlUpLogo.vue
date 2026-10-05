<script setup>
import { computed } from 'vue'
import logo from '@/assets/steamlvlup-logo.png'

const props = defineProps({
  height: {
    type: [Number, String],
    required: true,
  },
})

const size = computed(() =>
    typeof props.height === 'number' ? `${props.height}px` : props.height
)
</script>

<template>
  <a href="https://steamlvlup.com/" target="_blank" rel="noopener noreferrer" class="logo-link">
    <img :src="logo" alt="SteamLvlUp" :style="{ height: size, width: 'auto' }" />
  </a>
</template>

<style scoped>
.logo-link {
  display: inline-block;
  line-height: 0;
}
</style>