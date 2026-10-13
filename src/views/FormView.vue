<script setup>
import {computed, reactive, ref} from 'vue'
import {useRouter} from 'vue-router'
import {useHead} from '@unhead/vue'
import AppLoader from '@/components/AppLoader.vue'
import FormButton from '@/components/FormButton.vue'

defineOptions({name: 'FormView'})

const FORMS = [
  {
    id: 'streamer',
    label: 'Блок стримеров',
    title: 'Форма номинации «Стримеры» — PRIME 2026',
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSfSUu7bT6KIt4vJvoIWbO8iN72zHpg51t0alqoqaMH5s71-Kw/viewform?embedded=true',
  },
  {
    id: 'moment',
    label: 'Блок моментов',
    title: 'Форма номинации «Моменты» — PRIME 2026',
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSexHEFjKmWuJYTYoD4n0zNDVcG-GvahtrpqNud12XZ-f_IkHA/viewform?embedded=true',
  },
]

const router = useRouter()

// id открытой формы; null — экран выбора
const activeId = ref(null)
// Какие iframe уже загрузились (загрузчик показываем только до первой загрузки)
const loaded = reactive(Object.fromEntries(FORMS.map(({id}) => [id, false])))

const isLoading = computed(() => activeId.value !== null && !loaded[activeId.value])

const navButton = computed(() =>
    activeId.value
        ? {label: 'Назад', action: () => (activeId.value = null)}
        : {label: 'Главная', action: () => router.push('/')},
)

function openForm(id) {
  activeId.value = id
}

useHead({
  title: 'PRIME 2026 - Форма для голосования',
  meta: [
    {
      name: 'description',
      content: 'Главная народная премия ру-стриминга. Ежегодно подведём итоги, увидим борьбу легенд русскоязычного стриминга',
    },
  ],
  link: [
    {rel: 'canonical', href: 'https://prime-award.ru/form'},
  ],
})


</script>

<template>
  <main class="form-page">
    <FormButton
        class="form-page__nav"
        variant="ghost"
        @click="navButton.action"
    >
      <Transition name="fade" mode="out-in">
        <span :key="navButton.label">{{ navButton.label }}</span>
      </Transition>
    </FormButton>

    <!-- Экран выбора -->
    <Transition name="fade">
      <section v-if="!activeId" class="form-choice">
        <h1 class="form__title">Выберите форму</h1>

        <div class="form-choice__buttons">
          <FormButton
              v-for="form in FORMS"
              :key="form.id"
              @click="openForm(form.id)"
          >
            {{ form.label }}
          </FormButton>
        </div>
      </section>
    </Transition>

    <!--
      Оба iframe создаются сразу и живут всё время жизни страницы.
      Переключение — только через visibility, поэтому состояние форм не сбрасывается.
    -->
    <div class="form-view" :class="{ 'form-view--open': activeId }">
      <Transition name="fade">
        <div v-if="isLoading" class="form-loader">
          <AppLoader/>
        </div>
      </Transition>

      <iframe
          v-for="form in FORMS"
          :key="form.id"
          class="form-frame"
          :class="{ 'form-frame--active': form.id === activeId }"
          :src="form.url"
          :title="form.title"
          @load="loaded[form.id] = true"
      >
        Загрузка…
      </iframe>
    </div>

  </main>
</template>

<style scoped>
.form-page {
  position: relative;
  height: 100dvh;
  background: #08090b;
}

/* Кнопка «Главная» / «Назад»: слева сверху поверх всего */
.form-page .form-page__nav {
  position: absolute;
  top: 20px;
  left: 24px;
  z-index: 3;
  padding: 9px 20px;
  font-size: clamp(16px, 1.6vw, 22px);
}


/* Экран выбора: блок по центру */
.form-choice {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(24px, 4vw, 56px);
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

/* Слой с формами: всегда в DOM, но скрыт и не перехватывает клики, пока не открыта форма */
.form-view {
  position: absolute;
  inset: 0;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.form-view--open {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
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

/* Неактивный iframe остаётся в DOM (данные не теряются), но не виден и недоступен с клавиатуры */
.form-frame {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  visibility: hidden;
  filter: invert(90%);
}

.form-frame--active {
  visibility: visible;
}

</style>