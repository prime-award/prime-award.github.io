<script setup>
import logo from '../assets/logo.png'
</script>

<template>
  <header class="header">
    <img class="logo" :src="logo" alt="PRIME 2026" width="244" height="75" />
    <nav class="nav">
      <a href="#nominations">Номинации</a>
      <a href="#login">Вход</a>
    </nav>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40px;
  background: linear-gradient(180deg, var(--bg-top) 19.7%, var(--bg) 100%);
}
.logo { display: block; width: 244px; height: 75px; object-fit: cover; }
.nav { display: flex; gap: 50px; padding: 5px; font-size: 24px; }
.nav a { color: var(--text); text-decoration: none; transition: opacity 0.2s; }
.nav a:hover { opacity: 0.7; }

@media (max-width: 700px) {
  .header { padding: 20px; }
  .logo { width: 150px; height: auto; }
  .nav { gap: 24px; font-size: 18px; }
}
</style>
