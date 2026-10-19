<script setup lang="ts">
import {computed} from 'vue'
import {useRoute} from 'vue-router'
import primeLogo from '@/assets/prime-logo-2026.webp'
import {useAuth} from '@/composable/useAuth.ts'
import {useHeroInView} from '@/composable/useHeroVisibility.ts'
import {useLoginModal} from '@/composable/useLoginModal.ts'
import UserMenu from '@/components/auth/UserMenu.vue'

const {isLoggedIn} = useAuth()
const heroInView = useHeroInView()
const loginModal = useLoginModal()
const route = useRoute()

// Логотип слева виден, когда большой логотип главного экрана ушёл из вида (на остальных страницах — всегда)
const showLogo = computed(() => !heroInView.value)
// Фон появляется вместе с логотипом, чтобы над главным экраном шапка была прозрачной
const solid = computed(() => !heroInView.value)
</script>

<template>
  <header class="app-header" :class="{ 'is-solid': solid }">
    <RouterLink
        to="/"
        class="app-header__logo"
        :class="{ 'is-visible': showLogo }"
        :tabindex="showLogo ? 0 : -1"
        :aria-hidden="!showLogo"
        aria-label="PRIME — на главную"
    >
      <img :src="primeLogo" alt="PRIME 2026"/>
    </RouterLink>

    <div class="app-header__actions">
      <nav v-if="isLoggedIn && route.name !== 'home'" class="app-header__links" aria-label="Разделы">
        <RouterLink to="/">Главная</RouterLink>
        <RouterLink to="/profile">Профиль</RouterLink>
      </nav>
      <UserMenu v-if="isLoggedIn"/>
      <button
          v-else
          type="button"
          class="app-header__login"
          data-testid="login-button"
          @click="loginModal.open(route.fullPath)"
      >
        Войти
      </button>
    </div>
  </header>
</template>

<style scoped>
/* Top app bar M3: высота 64dp, поля — отступ раскладки. */
.app-header {
  position: fixed;
  inset: 0 0 auto;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  height: var(--header-h);
  padding-inline: var(--layout-margin);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.app-header.is-solid {
  background: rgba(8, 9, 11, 0.86);
  backdrop-filter: blur(12px);
  box-shadow: 0 1px 0 var(--line);
}

.app-header__logo {
  display: block;
  opacity: 0;
  transform: translateY(calc(-1 * var(--space-2)));
  pointer-events: none;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.app-header__logo.is-visible {
  opacity: 1;
  transform: none;
  pointer-events: auto;
}

.app-header__logo img {
  width: auto;
  height: var(--space-8);
}

.app-header__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-left: auto;
}

/* текстовые ссылки «Главная / Профиль» — как text button M3 */
.app-header__links {
  display: flex;
  gap: var(--space-1);
}

.app-header__links a,
.app-header__login {
  display: inline-flex;
  align-items: center;
  min-height: var(--control-h);
  padding: 0 var(--space-3);
  border: 0;
  border-radius: var(--shape-full);
  background: none;
  color: var(--text-muted);
  font: 400 var(--type-title-m) var(--font-serif);
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.app-header__login {
  color: var(--text);
  font: 500 var(--type-title-m) var(--font-text);
}

.app-header__links a:hover,
.app-header__login:hover {
  color: var(--text);
  background: var(--state-hover);
}

.app-header__links a.router-link-exact-active {
  color: var(--text);
}

/* compact: только логотип и меню */
@media (max-width: 599px) {
  .app-header__links {
    display: none;
  }
}
</style>
