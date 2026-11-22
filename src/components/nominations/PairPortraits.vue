<script setup lang="ts">
import type {Nominee} from '@/api'
import {mediaUrl} from '@/utils/media'

defineProps<{ nominee: Nominee, captions?: boolean, eager?: boolean }>()
</script>

<template>
  <div class="pair-portraits">
    <div v-for="(member, index) in [nominee.firstNominee, nominee.secondNominee]" :key="index" class="pair-portraits__member">
      <img v-if="member?.photoPath" :src="mediaUrl(member.photoPath)" alt="" draggable="false"
           :loading="eager ? 'eager' : 'lazy'" :class="{ mirrored: index === 1 }"/>
      <span v-if="captions" class="pair-portraits__name">{{ member?.name }}</span>
    </div>
    <span class="pair-portraits__emoji" aria-hidden="true">{{ nominee.emoji }}</span>
  </div>
</template>

<style scoped>
.pair-portraits {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  aspect-ratio: 3 / 2;
  background: var(--bg);
}
.pair-portraits__member {
  display: flex;
  min-height: 0;
  flex-direction: column;
  align-items: stretch;
  background: radial-gradient(ellipse at center, #687789, var(--bg));
}
.pair-portraits__member + .pair-portraits__member {
  border-left: 1px solid var(--border);
}
.pair-portraits__member img {
  flex: 1;
  width: 100%;
  min-height: 0;
  object-fit: cover;
  object-position: top center;
}
.mirrored {
  transform: scaleX(-1);
}
.pair-portraits__name {
  margin-top: auto;
  padding: var(--space-2);
  background: var(--bg);
  color: var(--text);
  font: 400 var(--type-title-m) var(--font-serif);
  text-align: center;
  overflow-wrap: anywhere;
}
.pair-portraits__emoji {
  position: absolute;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
  font-size: 64px;
  line-height: 1;
  pointer-events: none;
}
</style>
