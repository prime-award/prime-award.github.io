<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import LoginModal from '@/components/auth/LoginModal.vue'
import {useAppConfig} from '@/composable/useAppConfig.ts'
import {useAuth} from '@/composable/useAuth.ts'

// при старте: публичный конфиг (провайдеры, дедлайн) и сверка сохранённой сессии с сервером
useAppConfig().load()
useAuth().refresh()
</script>

<template>
  <AppHeader v-if="!$route.meta.bare"/>
  <RouterView/>
  <LoginModal/>
</template>
