<script setup>
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import AppLoader from '@/components/AppLoader.vue'
import FormButton from '@/components/FormButton.vue'

const STREAMER_FORM_URL =
    'https://docs.google.com/forms/d/e/1FAIpQLSfSUu7bT6KIt4vJvoIWbO8iN72zHpg51t0alqoqaMH5s71-Kw/viewform?embedded=true'
const MOMENT_FORM_URL =
    'https://docs.google.com/forms/d/e/1FAIpQLSexHEFjKmWuJYTYoD4n0zNDVcG-GvahtrpqNud12XZ-f_IkHA/viewform?embedded=true'

// Ссылка выбранной формы. Пока пусто — показан экран выбора, iframe не подключён
const currentUrl = ref('')
// true — iframe ещё грузится
const loading = ref(false)

function openForm(url) {
  loading.value = true
  currentUrl.value = url
}

// Назад: уходим на главную, FormView размонтируется и форма закрывается
function goBack() {
  currentUrl.value = ''
}
</script>

<template>
  <main class="form-page">
    <Transition name="fade">
      <FormButton
          v-if="currentUrl"
          class="form-page__back"
          variant="ghost"
          @click="goBack"
      >
        Назад
      </FormButton>
    </Transition>

    <Transition name="fade" mode="out-in">
      <!-- Экран выбора -->
      <section v-if="!currentUrl" key="choice" class="form-choice">
        <h1 class="form__title">Выберите форму</h1>

        <div class="form-choice__buttons">
          <FormButton @click="openForm(STREAMER_FORM_URL)">Блок стримеров</FormButton>
          <FormButton @click="openForm(MOMENT_FORM_URL)">Блок моментов</FormButton>
        </div>
      </section>

      <!-- Форма -->
      <div v-else key="form" class="form-view">
        <Transition name="fade">
          <div v-if="loading" class="form-loader">
            <AppLoader/>
          </div>
        </Transition>

        <iframe
            class="form-frame"
            :class="{ 'form-frame--hidden': loading }"
            :src="currentUrl"
            title="Форма участия PRIME 2026"
            @load="loading = false"
        >
          Загрузка…
        </iframe>
      </div>
    </Transition>
  </main>
</template>

<style scoped>
.form-page {
  position: relative;
  height: 100dvh;
  background: #08090b;
}

/* Кнопка «Назад»: только кнопка, слева сверху поверх всего */
.form-page .form-page__back {
  position: absolute;
  top: 20px;
  left: 24px;
  z-index: 2;
  padding: 9px 20px;
  font-size: clamp(16px, 1.6vw, 22px);
}

/* Экран выбора: блок по центру */
.form-choice {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(24px, 4vw, 56px);
  height: 100%;
  padding: 0 24px;
  text-align: center;
}

.form__title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(32px, 4vw, 76px);
  line-height: normal;
  color: var(--text);
}

.form-choice__buttons {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

/* Форма */
.form-view {
  position: relative;
  height: 100%;
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>