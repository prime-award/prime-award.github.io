<script setup lang="ts">
import {ref} from 'vue'
import {mediaUrl} from '@/utils/media'

defineProps<{ name?: string, photoPath?: string | null, participants?: string | null, eager?: boolean, mirrored?: boolean }>()
const loaded = ref(false)
</script>

<template>
  <div class="portrait">
    <div class="nominee-card__media" :class="{ 'nominee-card__media--logo': photoPath?.startsWith('media/nominees/logos/') }">
      <slot>
        <img v-if="photoPath" :src="mediaUrl(photoPath)" :class="{'is-loaded': loaded, mirrored}"
           alt="" draggable="false" decoding="async" :loading="eager ? 'eager' : 'lazy'" @load="loaded = true"/>
      </slot>
    </div>
    <div class="nominee-card__caption">
      <h3 class="nominee-card__name">{{ name }}</h3>
      <p v-if="participants" class="portrait__participants">{{ participants }}</p>
    </div>
  </div>
</template>

<style scoped>
.portrait {
  display: flex;
  flex-direction: column;
  container-type: inline-size;
  flex: 1;
  min-width: 0;
  min-height: min-content;
}

.nominee-card__media {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: radial-gradient(70% 60% at 50% 45%, rgba(104, 119, 137, 0.9) 0%, rgba(56, 64, 74, 0.45) 50%, transparent 100%);
}

.nominee-card__media > :deep(*) {
  position: absolute;
  inset: 0;
}

.nominee-card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  opacity: 0;
  transition: opacity 0.4s ease, filter 0.3s ease;
}

.nominee-card__media img.is-loaded {
  opacity: 1;
}

/* плавный переход фото в фон карточки под ником */
.nominee-card__media::after {
  content: '';
  position: absolute;
  inset: auto 0 0;
  height: 40%;
  background: linear-gradient(to top, var(--bg), transparent);
}

.nominee-card__media--logo img {
  box-sizing: border-box;
  object-fit: contain;
  object-position: center;
  padding: var(--space-3);
}

.nominee-card__media--logo::after {
  content: none;
}

.nominee-card__caption {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: filter 0.3s ease;
  gap: var(--space-1) var(--space-2);
  padding: var(--space-2) var(--space-3) var(--space-4);
}

.nominee-card__name {
  margin: 0;
  font: 400 var(--type-card-title) var(--font-serif);
  color: #fff;
  text-align: center;
  text-transform: uppercase;
  overflow-wrap: anywhere;
}

.mirrored {
  transform: scaleX(-1);
}

.portrait__participants {
  margin: 0;
  font: var(--type-body-s) var(--font-serif);
  color: var(--text-subtle);
  text-align: center;
  overflow-wrap: anywhere;
}

@container (max-width: 240px) {
  .nominee-card__name {
    font: 400 var(--type-title-m) var(--font-serif);
  }
}
</style>
