<script setup lang="ts">
import {computed, nextTick, ref, watch} from 'vue'
import {mediaUrl} from '@/utils/media.ts'
import {embedUrl, parseVideoSource} from './videoSource.ts'

// Большой экран с видео над номинантами: файл — через <video>, YouTube/Twitch — через iframe.
const props = defineProps<{
  url: string | null
  poster?: string | null
  title: string
}>()

const source = computed(() => parseVideoSource(props.url))
const video = ref<HTMLVideoElement | null>(null)
const start = ref(0)
const autoplay = ref(false)
const iframeSrc = computed(() =>
    source.value && source.value.kind !== 'file' ? embedUrl(source.value, start.value, autoplay.value) : null,
)

watch(() => props.url, () => {
  start.value = 0
  autoplay.value = false
})

/** Перемотать на момент и запустить (таймкод на карточке момента). */
async function seek(seconds: number) {
  start.value = seconds
  autoplay.value = true
  await nextTick()
  const el = video.value
  if (!el) return
  const go = () => {
    el.currentTime = seconds
    el.play().catch(() => {})
  }
  // плеер мог только что открыться: до загрузки метаданных перемотка игнорируется браузером
  if (el.readyState >= HTMLMediaElement.HAVE_METADATA) go()
  else el.addEventListener('loadedmetadata', go, {once: true})
}

defineExpose({seek})
</script>

<template>
  <div class="player" :aria-label="`Видео: ${title}`">
    <video
        v-if="source?.kind === 'file'"
        ref="video"
        class="player__media"
        :src="source.src"
        :poster="mediaUrl(poster)"
        controls
        playsinline
        preload="metadata"
    />
    <iframe
        v-else-if="iframeSrc"
        class="player__media"
        :src="iframeSrc"
        :title="title"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowfullscreen
    />
    <div v-else class="player__placeholder">
      <span>Видео появится позже</span>
    </div>
  </div>
</template>

<style scoped>
/* Экран видео 16:9: не шире --player-max-w и не выше --player-max-h, чтобы под ним были видны карточки. */
.player {
  position: relative;
  width: min(100%, var(--player-max-w), var(--player-max-h) * 16 / 9);
  aspect-ratio: 16 / 9;
  margin-inline: auto;
  overflow: hidden;
  border-radius: var(--shape-lg);
  background: var(--surface-2);
  box-shadow: 0 4px 8px 3px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.3);
}

.player__media {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  background: #000;
  object-fit: contain;
}

.player__placeholder {
  display: grid;
  place-items: center;
  height: 100%;
  color: var(--muted);
  font: 400 var(--type-headline-s) var(--font-display);
}
</style>
