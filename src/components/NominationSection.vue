<script setup>
import n1 from '../assets/nominee-1.png'
import n2 from '../assets/nominee-2.png'
import n3 from '../assets/nominee-3.png'
import n4 from '../assets/nominee-4.png'

const nominees = [
  { name: 'arrowwoods', photo: n1 },
  { name: 'honeymad', photo: n2 },
  { name: 'melharucos', photo: n3 },
  { name: 'lasqa', photo: n4 },
]
</script>

<template>
  <section id="nominations" class="nomination">
    <h2 class="title">Король рунета 2026</h2>
    <div class="cards">
      <article v-for="n in nominees" :key="n.name" class="card">
        <div class="photo">
          <img :src="n.photo" :alt="n.name" loading="lazy" />
        </div>
        <h3 class="name">{{ n.name }}</h3>
      </article>
    </div>
  </section>
</template>

<style scoped>
.nomination { padding: 60px; display: flex; flex-direction: column; gap: 20px; }
.title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(40px, 5vw, 96px);
  line-height: normal;
  text-transform: uppercase;
  color: var(--white);
}
.cards {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 370px));
  justify-content: space-between;
  gap: 20px;
}
.card { display: flex; flex-direction: column; align-items: center; gap: 10px; }

.photo {
  position: relative;
  width: 100%;
  aspect-ratio: 370 / 450;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(104, 119, 137, 0.5), rgba(8, 9, 11, 0.5));
}
.photo img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
}
/* внутренняя тень поверх фото, как в макете */
.photo::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  box-shadow: inset 0 6px 60px rgba(0, 0, 0, 0.7), inset 0 4px 8.5px rgba(0, 0, 0, 0.25);
}
.name {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(22px, 1.9vw, 36px);
  text-transform: uppercase;
  color: var(--white);
}

@media (max-width: 1100px) {
  .nomination { padding: 40px 20px; }
  .cards { grid-template-columns: repeat(2, minmax(0, 370px)); justify-content: center; }
}
@media (max-width: 560px) {
  .cards { grid-template-columns: minmax(0, 370px); }
}
</style>
