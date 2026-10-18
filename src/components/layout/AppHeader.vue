<script setup lang="ts">
import {computed} from 'vue'
import {useRoute} from 'vue-router'
import primeLogo from '@/assets/prime-logo.png'
import {useAuth} from '@/composable/useAuth.ts'
import {useHeroInView} from '@/composable/useHeroVisibility.ts'
import {useLoginModal} from '@/composable/useLoginModal.ts'
import UserMenu from '@/components/auth/UserMenu.vue'
import PrimeButton from '@/components/ui/PrimeButton.vue'

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
      <img :src="primeLogo" alt="PRIME"/>
    </RouterLink>

    <div class="app-header__actions">
      <UserMenu v-if="isLoggedIn"/>
      <PrimeButton
          v-else
          variant="ghost"
          size="sm"
          class="app-header__login"
          data-testid="login-button"
          @click="loginModal.open(route.fullPath)"
      >
        Войти
      </PrimeButton>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: fixed;
  inset: 0 0 auto;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-h);
  padding-inline: var(--page-pad);
  transition: background-color 0.3s ease, backdrop-filter 0.3s ease, box-shadow 0.3s ease;
}

.app-header.is-solid {
  background: rgba(8, 9, 11, 0.82);
  backdrop-filter: blur(10px);
  box-shadow: 0 1px 0 rgba(229, 231, 234, 0.06);
}

.app-header__logo {
  display: block;
  opacity: 0;
  transform: translateY(-6px);
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
  height: 36px;
}

.app-header__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.app-header__login {
  color: var(--text);
  font-size: 18px;
}
</style>
