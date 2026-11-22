<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from 'vue'
import createPlayer from 'youtube-player'

const props = defineProps<{url: string, start: number, end: number, title: string}>()
const container = ref<HTMLDivElement>()
const failed = ref(false)
let player: ReturnType<typeof createPlayer> | undefined
let timer: number | undefined

function segment(startSeconds = props.start) {
  return {videoId: new URL(props.url).pathname.slice(1), startSeconds, endSeconds: props.end}
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
  const target = document.createElement('div')
  container.value!.append(target)
  const api = createPlayer(target, {
    width: '100%', height: '100%', videoId: segment().videoId,
    playerVars: {start: props.start, end: props.end, playsinline: 1, origin: location.origin, rel: 0},
  })
  player = api
  api.on('error', () => { failed.value = true })
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
    <div v-show="!failed" ref="container" class="player__media" />
    <div v-if="failed" class="player__placeholder">Не удалось загрузить видео</div>
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
