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
  margin-top: clamp(40px, 4vw, 70px);
}

.profile-section__head {
  margin: 0 0 clamp(16px, 1.6vw, 24px);
}

.profile-section__toggle {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  padding: 0;
  border: 0;
  background: none;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(24px, 2.2vw, 40px);
  cursor: pointer;
}

/* треугольник из макета: ▼ открыто, ▶ свёрнуто */
.profile-section__caret {
  width: 0;
  height: 0;
  border-inline: 9px solid transparent;
  border-top: 14px solid var(--text);
  transform: rotate(-90deg);
  transition: transform 0.2s ease;
}

.profile-section__caret.is-open {
  transform: none;
}

.profile-section__count {
  padding: 3px 10px;
  border: 1px solid var(--line);
  border-radius: var(--radius-pill);
  color: var(--muted-2);
  font-family: var(--font-text);
  font-size: 14px;
}

.profile-section__empty {
  margin: 0;
  padding: 28px;
  border: 1px dashed var(--line);
  border-radius: var(--radius-card);
  color: var(--muted-2);
  text-align: center;
}

.profile-section__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(14px, 2vw, 36px);
  margin: 0;
  padding: 0;
  list-style: none;
}

.profile-section__pages {
  margin-top: 20px;
}

@media (max-width: 1000px) {
  .profile-section__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .profile-section__grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
