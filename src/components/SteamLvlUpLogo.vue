<script setup>
import {computed} from 'vue'
import logo from '@/assets/steamlvlup-logo.png'


</script>

<template>
  <a href="https://steamlvlup.com/" target="_blank" rel="noopener noreferrer" class="logo-link">
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
  width: clamp(200px, 8vw, 400px);
  object-fit: contain;
}
</style>