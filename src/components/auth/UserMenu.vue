<script setup lang="ts">
import {computed, onBeforeUnmount, ref} from 'vue'
import {useRouter} from 'vue-router'
import {useAuth} from '@/composable/useAuth.ts'
import {useAppConfig} from '@/composable/useAppConfig.ts'
import {useVoteNavigation} from '@/composable/useVoteNavigation.ts'
import UserAvatar from './UserAvatar.vue'

const {user, logout} = useAuth()
const {config} = useAppConfig()
const {openNextBallot} = useVoteNavigation()
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

async function go(action: 'profile' | 'ballot' | 'stats' | 'logout') {
  open.value = false
  if (action === 'profile') await router.push('/profile')
  else if (action === 'ballot') await openNextBallot()
  else if (action === 'stats') await router.push('/dev/stats')
  else {
    await logout()
    if (router.currentRoute.value.meta.requiresAuth) await router.push('/')
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
      <UserAvatar :user="user" :size="36"/>
      <span class="user-menu__name" :style="{ color: nameColor }">{{ user.displayName }}</span>
      <span class="user-menu__caret" aria-hidden="true">▾</span>
    </button>

    <Transition name="menu">
      <ul v-show="open" class="user-menu__list" role="menu">
        <li role="none"><button type="button" role="menuitem" @click="go('profile')">Профиль</button></li>
        <li role="none"><button type="button" role="menuitem" @click="go('ballot')">Анкета</button></li>
        <li v-if="config?.devLogin" role="none">
          <button type="button" role="menuitem" @click="go('stats')">Статистика <small>dev</small></button>
        </li>
        <li role="none"><button type="button" role="menuitem" class="is-danger" @click="go('logout')">Выйти</button></li>
      </ul>
    </Transition>
  </div>
</template>

<style scoped>
.user-menu {
  position: relative;
}

.user-menu__trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: min(320px, 55vw);
  padding: 4px 12px 4px 4px;
  border: 1px solid var(--line);
  border-radius: var(--radius-pill);
  background: rgba(14, 16, 20, 0.7);
  backdrop-filter: blur(8px);
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.user-menu__trigger:hover,
.user-menu__trigger[aria-expanded='true'] {
  border-color: var(--line-strong);
}

.user-menu__name {
  overflow: hidden;
  font-size: 15px;
  font-weight: 500;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.user-menu__caret {
  font-size: 11px;
  color: var(--muted-2);
}

.user-menu__list {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 10;
  min-width: 200px;
  margin: 0;
  padding: 6px;
  list-style: none;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: rgba(14, 16, 20, 0.96);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
}

/* «мостик», чтобы меню не закрывалось, пока курсор едет от кнопки к списку */
.user-menu__list::before {
  content: '';
  position: absolute;
  inset: -10px 0 auto;
  height: 10px;
}

.user-menu__list button {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  width: 100%;
  padding: 10px 12px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  font-size: 15px;
  text-align: left;
  cursor: pointer;
}

.user-menu__list button:hover,
.user-menu__list button:focus-visible {
  background: rgba(229, 231, 234, 0.08);
  outline: none;
}

.user-menu__list small {
  color: var(--muted);
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
  transform: translateY(-4px);
}

@media (max-width: 480px) {
  .user-menu__name {
    max-width: 34vw;
    font-size: 14px;
  }
}
</style>
