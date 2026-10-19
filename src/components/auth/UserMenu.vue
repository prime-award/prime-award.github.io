<script setup lang="ts">
import {computed, onBeforeUnmount, ref} from 'vue'
import {useRouter} from 'vue-router'
import {useAuth} from '@/composable/useAuth.ts'
import UserAvatar from './UserAvatar.vue'

const {user, logout} = useAuth()
const router = useRouter()

// Меню открывается наведением (desktop), кликом (тач) и с клавиатуры
const open = ref(false)
const root = ref<HTMLElement | null>(null)
let closeTimer: ReturnType<typeof setTimeout> | undefined
// когда меню открыто наведением, клик по кнопке сразу после этого не должен его закрывать
let hoverOpenedAt = 0

const nameColor = computed(() => user.value?.nameColor ?? undefined)

// наведение работает только для мыши: на тач-экране тап = enter + click, и меню бы сразу закрылось
function onPointerEnter(event: PointerEvent) {
  if (event.pointerType !== 'mouse') return
  clearTimeout(closeTimer)
  if (!open.value) hoverOpenedAt = Date.now()
  open.value = true
}

function onPointerLeave(event: PointerEvent) {
  if (event.pointerType !== 'mouse') return
  clearTimeout(closeTimer)
  closeTimer = setTimeout(() => (open.value = false), 150)
}

function toggle() {
  if (open.value && Date.now() - hoverOpenedAt < 700) return
  open.value = !open.value
}

function onFocusOut(event: FocusEvent) {
  if (!root.value?.contains(event.relatedTarget as Node | null)) open.value = false
}

async function go(action: 'profile' | 'logout') {
  open.value = false
  if (action === 'profile') await router.push('/profile')
  else {
    await logout()
    // после выхода — всегда на главную
    await router.push('/')
  }
}

onBeforeUnmount(() => clearTimeout(closeTimer))
</script>

<template>
  <div
      v-if="user"
      ref="root"
      class="user-menu"
      @pointerenter="onPointerEnter"
      @pointerleave="onPointerLeave"
      @focusout="onFocusOut"
      @keydown.esc="open = false"
  >
    <button
        type="button"
        class="user-menu__trigger"
        :aria-expanded="open"
        aria-haspopup="menu"
        data-testid="user-menu"
        @click="toggle"
    >
      <UserAvatar :user="user" :size="32"/>
      <span class="user-menu__name" :style="{ color: nameColor }">{{ user.displayName }}</span>
      <span class="user-menu__caret" aria-hidden="true">▾</span>
    </button>

    <Transition name="menu">
      <ul v-show="open" class="user-menu__list" role="menu">
        <!-- заголовок меню: под каким аккаунтом вход (на телефоне ника в шапке нет) -->
        <li class="user-menu__header" role="presentation">
          <span class="user-menu__header-name" :style="{ color: nameColor }">{{ user.displayName }}</span>
          <span class="user-menu__header-login">@{{ user.login }}</span>
        </li>
        <li role="none"><button type="button" role="menuitem" @click="go('profile')">Профиль</button></li>
        <li role="none"><button type="button" role="menuitem" class="is-danger" @click="go('logout')">Выйти</button></li>
      </ul>
    </Transition>
  </div>
</template>

<style scoped>
.user-menu {
  position: relative;
  min-width: 0;
  max-width: 100%;
}

/* кнопка пользователя: высота 40dp, аватар 32dp, скругление 4dp */
.user-menu__trigger {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  max-width: min(var(--chip-max-w), 100%);
  min-height: var(--control-h);
  padding: var(--space-1) var(--space-3) var(--space-1) var(--space-1);
  border: 1px solid var(--line);
  border-radius: var(--shape-xs);
  background: rgba(14, 16, 20, 0.7);
  backdrop-filter: blur(8px);
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.user-menu__trigger:hover,
.user-menu__trigger[aria-expanded='true'] {
  border-color: var(--line-strong);
}

.user-menu__name {
  min-width: 0;
  overflow: hidden;
  font: 500 var(--type-label-l) var(--font-text);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.user-menu__caret {
  font: var(--type-label-s) var(--font-text);
  color: var(--muted-2);
}

/* меню M3: контейнер со скруглением 4dp, пункты 48dp, поля 12dp */
.user-menu__list {
  position: absolute;
  top: calc(100% + var(--space-1));
  right: 0;
  z-index: 10;
  min-width: var(--menu-min);
  margin: 0;
  padding: var(--space-2) 0;
  list-style: none;
  border-radius: var(--shape-xs);
  background: var(--surface-3);
  box-shadow: 0 2px 6px 2px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* «мостик», чтобы меню не закрывалось, пока курсор едет от кнопки к списку */
.user-menu__list::before {
  content: '';
  position: absolute;
  inset: calc(-1 * var(--space-2)) 0 auto;
  height: var(--space-2);
}

.user-menu__header {
  display: grid;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3) var(--space-3);
  margin-bottom: var(--space-2);
  border-bottom: 1px solid var(--line);
}

.user-menu__header-name {
  overflow: hidden;
  font: 500 var(--type-title-s) var(--font-text);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-menu__header-login {
  color: var(--muted-2);
  font: var(--type-body-s) var(--font-text);
}

.user-menu__list button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  min-height: var(--touch-target);
  padding: 0 var(--space-3);
  border: 0;
  background: transparent;
  font: 400 var(--type-body-l) var(--font-text);
  text-align: left;
  cursor: pointer;
}

.user-menu__list button:hover,
.user-menu__list button:focus-visible {
  background: var(--state-hover);
  outline: none;
}

.user-menu__list small {
  color: var(--muted-2);
  font: var(--type-label-m) var(--font-text);
}

.user-menu__list .is-danger {
  color: var(--danger);
}

.menu-enter-active,
.menu-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(calc(-1 * var(--space-1)));
}

/* compact: в шапке только аватар (ник — в заголовке меню), чтобы спонсор по центру и меню не пересекались */
@media (max-width: 599px) {
  .user-menu__trigger {
    padding: var(--space-1) var(--space-2) var(--space-1) var(--space-1);
  }

  .user-menu__name {
    display: none;
  }
}
</style>
