<script setup>
import { ref } from 'vue'
import AppLoader from '@/components/AppLoader.vue' // поправьте путь под свою структуру

const FORM_URL =
    'https://docs.google.com/forms/d/e/1FAIpQLSeodVMhtCAmse5oRIwI-DPA1HdqCs9C01qpoaKj2pVfLkl9JQ/viewform?embedded=true'

const loading = ref(true)
</script>

<template>
  <main class="form-page">
    <Transition name="fade">
      <div v-if="loading" class="form-loader">
        <AppLoader />
      </div>
    </Transition>

    <iframe
        class="form-frame"
        :class="{ 'form-frame--hidden': loading }"
        :src="FORM_URL"
        title="Форма участия PRIME 2026"
        @load="loading = false"
    >
      Загрузка…
    </iframe>
  </main>
</template>

<style scoped>
.form-page {
  position: relative;
  height: 100dvh;
  background: #08090b;
}

.form-loader {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #08090b;
  z-index: 1;
}

.form-frame {
  display: block;
  width: 100%;
  height: 100%;
  margin: 0 auto;
  border: 0;
  filter: invert(90%);
  transition: opacity 0.3s ease;
}

.form-frame--hidden {
  opacity: 0;
}

.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-leave-to {
  opacity: 0;
}
</style>