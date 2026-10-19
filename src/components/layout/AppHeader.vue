<script setup lang="ts">
import {computed} from 'vue'
import {useRoute} from 'vue-router'
import primeLogo from '@/assets/prime-logo-2026.webp'
import {useAuth} from '@/composable/useAuth.ts'
import {useHeroInView} from '@/composable/useHeroVisibility.ts'
import {useLoginModal} from '@/composable/useLoginModal.ts'
import UserMenu from '@/components/auth/UserMenu.vue'
import SteamLvlUpLogo from '@/components/SteamLvlUpLogo.vue'

const {isLoggedIn} = useAuth()
const heroInView = useHeroInView()
const loginModal = useLoginModal()
const route = useRoute()

// Логотипы PRIME и спонсора видны, когда главный экран (с их крупными версиями) ушёл из вида; на остальных страницах — всегда
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

    <!-- спонсор — по центру шапки; как и логотип PRIME, появляется, когда главный экран (там свой логотип) ушёл из вида -->
    <SteamLvlUpLogo
        class="app-header__sponsor"
        :class="{ 'is-visible': showLogo }"
        :tabindex="showLogo ? 0 : -1"
        :aria-hidden="!showLogo"
        variant="header"
    />

    <div class="app-header__actions">
      <nav v-if="isLoggedIn && route.name !== 'home'" class="app-header__links" aria-label="Разделы">
        <RouterLink to="/">Главная</RouterLink>
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
/* Top app bar M3: высота 64dp, поля — отступ раскладки.
   Три колонки: логотип PRIME | спонсор строго по центру | вход или меню. */
.app-header {
  position: fixed;
  inset: 0 0 auto;
  z-index: 100;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
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

.app-header__logo,
.app-header__sponsor {
  display: block;
  opacity: 0;
  transform: translateY(calc(-1 * var(--space-2)));
  pointer-events: none;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.app-header__logo {
  justify-self: start;
}

.app-header__logo.is-visible,
.app-header__sponsor.is-visible {
  opacity: 1;
  transform: none;
  pointer-events: auto;
}

.app-header__logo img {
  width: auto;
  height: var(--space-8);
}

.app-header__sponsor {
  justify-self: center;
}

/* пока логотип скрыт, он не должен перехватывать клики по главному экрану */
.app-header__sponsor:not(.is-visible) {
  visibility: hidden;
  transition: opacity 0.3s ease, transform 0.3s ease, visibility 0s 0.3s;
}

.app-header__actions {
  justify-self: end;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
  max-width: 100%;
}

/* текстовая ссылка «Главная» — как text button M3 */
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

/* до expanded ссылку «Главная» прячем: на главную ведёт логотип, а место нужно чипу пользователя */
@media (max-width: 839px) {
  .app-header__links {
    display: none;
  }
}

/* compact: логотип PRIME меньше — чтобы спонсор по центру и меню влезали в 360px */
@media (max-width: 599px) {
  .app-header {
    gap: var(--space-2);
  }

  .app-header__logo img {
    height: var(--space-6);
  }
}
</style>
