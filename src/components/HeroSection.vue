<template>
  <section class="hero">
    <h1 class="title">Главная премия<br />ру- стриминга</h1>
    <ul class="partners">
      <li>гик новости</li>
      <li>balcony</li>
      <li>steamlvlup</li>
    </ul>
  </section>
</template>

<style scoped>
.hero { padding: 80px 20px 0; text-align: center; }
.title {
  margin: 0;
  padding-bottom: 40px;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(40px, 5vw, 96px);
  line-height: normal;
  text-transform: uppercase;
  color: var(--text);
}
.partners {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px 70px;
  margin: 0;
  padding: 0 69px;
  list-style: none;
  font-family: var(--font-display);
  font-size: clamp(18px, 1.67vw, 32px);
  text-transform: uppercase;
  color: var(--muted);
}
</style>
