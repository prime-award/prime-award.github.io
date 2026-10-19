<script setup lang="ts" generic="T">
import {computed, ref, toRef} from 'vue'
import PageNav from '@/components/ui/PageNav.vue'
import {usePagination} from '@/composable/usePagination.ts'

// Сворачиваемая секция профиля (▾ «Ждут вашего голоса» / ▾ «Ваш выбор») со страницами по pageSize карточек.
const props = withDefaults(defineProps<{
  title: string
  items: readonly T[]
  pageSize?: number
  /** ключ элемента для v-for */
  itemKey: (item: T) => string | number
  emptyText: string
  testId: string
}>(), {pageSize: 6})

const open = ref(true)
const {page, totalPages, pageItems, setPage} = usePagination(toRef(props, 'items'), props.pageSize)
const count = computed(() => props.items.length)
</script>

<template>
  <section class="profile-section" :data-testid="testId">
    <h2 class="profile-section__head">
      <button type="button" class="profile-section__toggle" :aria-expanded="open" @click="open = !open">
        <span class="profile-section__caret" :class="{ 'is-open': open }" aria-hidden="true"/>
        {{ title }}
        <span class="profile-section__count">{{ count }}</span>
      </button>
    </h2>

    <div v-show="open">
      <p v-if="!count" class="profile-section__empty">{{ emptyText }}</p>
      <ul v-else class="profile-section__grid">
        <li v-for="item in pageItems" :key="itemKey(item as T)">
          <slot :item="item"/>
        </li>
      </ul>
      <PageNav class="profile-section__pages" :page="page" :total="totalPages" :label="`Страницы: ${title}`" @change="setPage"/>
    </div>
  </section>
</template>

<style scoped>
.profile-section + .profile-section {
  margin-top: var(--space-12);
}

.profile-section__head {
  margin: 0 0 var(--space-4);
}

/* заголовок-переключатель: зона нажатия 48dp, текст — subtitle */
.profile-section__toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  min-height: var(--touch-target);
  padding: 0 var(--space-2) 0 0;
  border: 0;
  background: none;
  font: 700 var(--type-subtitle) var(--font-serif);
  cursor: pointer;
}

/* треугольник: ▼ открыто, ▶ свёрнуто */
.profile-section__caret {
  width: 0;
  height: 0;
  border-inline: var(--space-2) solid transparent;
  border-top: var(--space-3) solid var(--text);
  transform: rotate(-90deg);
  transition: transform 0.2s ease;
}

.profile-section__caret.is-open {
  transform: none;
}

.profile-section__count {
  padding: 0 var(--space-2);
  border: 1px solid var(--line);
  border-radius: var(--shape-full);
  color: var(--muted-2);
  font: var(--type-label-m) var(--font-text);
}

.profile-section__empty {
  margin: 0;
  padding: var(--space-6);
  border: 1px dashed var(--line);
  border-radius: var(--shape-lg);
  color: var(--muted-2);
  text-align: center;
}

.profile-section__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--layout-gutter);
  margin: 0;
  padding: 0;
  list-style: none;
}

.profile-section__pages {
  margin-top: var(--space-4);
}

/* колонки — по ширине самой секции (рядом с визиткой она уже окна), карточка не уже ~272dp */
.profile-section {
  container-type: inline-size;
}

@container (min-width: 560px) {
  .profile-section__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@container (min-width: 864px) {
  .profile-section__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
