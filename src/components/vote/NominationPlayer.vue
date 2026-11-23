<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref} from 'vue'
import {parseVideoSource, embedUrl} from './videoSource'
import createPlayer from 'youtube-player'

const props = defineProps<{url: string, start: number, end: number, title: string}>()
const frame = ref<HTMLIFrameElement>()
const source = computed(() => {
  const parsed = parseVideoSource(props.url)
  return parsed?.kind === 'youtube' ? parsed : null
})
const embedSrc = computed(() => {
  if (!source.value) return undefined
  const url = new URL(embedUrl(source.value, props.start))
  url.searchParams.set('end', String(props.end))
  url.searchParams.set('enablejsapi', '1')
  url.searchParams.set('playsinline', '1')
  url.searchParams.set('origin', window.location.origin)
  return url.href
})
const failed = ref(false)
let player: ReturnType<typeof createPlayer> | undefined
let timer: number | undefined

function segment(startSeconds = props.start) {
  return {videoId: source.value!.id, startSeconds, endSeconds: props.end}
}

function reset() {
  window.clearInterval(timer)
  // cueVideoById возвращает фрагмент к началу и ждёт следующего нажатия Play.
  void player?.cueVideoById(segment())
}

function seek(seconds: number) {
  if (seconds >= props.start && seconds < props.end) void player?.loadVideoById(segment(seconds))
}

onMounted(() => {
  if (!frame.value) return
  const api = createPlayer(frame.value)
  player = api
  api.on('error', (event) => {
    if ('data' in event && typeof event.data === 'number') failed.value = true
  })
  api.on('stateChange', ({data}) => {
    if (!player) return
    window.clearInterval(timer)
    if (data === 0) reset()
    if (data === 1) {
      timer = window.setInterval(async () => {
        const time = await api.getCurrentTime()
        if (player && (time >= props.end || time < props.start - 1)) reset()
      }, 200)
    }
  })
})

onBeforeUnmount(() => {
  window.clearInterval(timer)
  void player?.destroy()
  player = undefined
})
defineExpose({seek})
</script>

<template>
  <div class="player" :aria-label="`Видео: ${title}`">
    <iframe v-if="embedSrc" v-show="!failed" ref="frame" class="player__media"
            :src="embedSrc" :title="title" referrerpolicy="strict-origin-when-cross-origin"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen />
    <div v-if="failed || !embedSrc" class="player__placeholder">
      <a :href="url" target="_blank" rel="noopener">Открыть видео на YouTube</a>
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
