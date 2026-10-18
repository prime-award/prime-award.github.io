<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import type {User} from '@/api'
import {mediaUrl} from '@/utils/media.ts'

const props = withDefaults(defineProps<{ user: User, size?: number }>(), {size: 36})

// аватар с CDN платформы может не загрузиться — тогда буква ника
const failed = ref(false)
watch(() => props.user.avatarUrl, () => (failed.value = false))

const src = computed(() => (failed.value ? undefined : mediaUrl(props.user.avatarUrl)))
const initial = computed(() => props.user.displayName.trim().charAt(0).toUpperCase() || '?')
</script>

<template>
  <span class="avatar" :style="{ width: `${size}px`, height: `${size}px`, '--avatar-color': user.nameColor ?? '#687789' }">
    <img v-if="src" :src="src" alt="" referrerpolicy="no-referrer" @error="failed = true"/>
    <span v-else class="avatar__initial" aria-hidden="true">{{ initial }}</span>
  </span>
</template>

<style scoped>
.avatar {
  position: relative;
  display: inline-grid;
  place-items: center;
  flex: none;
  overflow: hidden;
  border-radius: 50%;
  background: color-mix(in srgb, var(--avatar-color) 35%, var(--surface-2));
  box-shadow: 0 0 0 1px var(--line);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
}

.avatar__initial {
  font-family: var(--font-display);
  font-size: 0.5em;
  color: var(--text);
}
</style>
