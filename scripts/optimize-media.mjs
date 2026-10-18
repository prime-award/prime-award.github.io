#!/usr/bin/env node
/**
 * Оптимизация медиа (запускать вручную после добавления новых картинок): npm run media:optimize
 *
 * - плашки номинаций public/media/nominations/*.png -> .webp (PNG удаляется; пути в базе — *.webp);
 * - логотип src/assets/prime-logo.png -> prime-logo.webp шириной до 1200 px;
 * - постер видео главного экрана media/video/main-background-poster.webp (из src/assets/hero-bg.png).
 *
 * Повторный запуск безопасен: уже сконвертированные файлы пропускаются.
 */
import {readdir, rm, stat} from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const rel = (p) => path.relative(root, p)
const kb = async (p) => Math.round((await stat(p)).size / 1024)

async function exists(p) {
    return stat(p).then(() => true, () => false)
}

async function convert(src, dest, pipeline) {
    if (await exists(dest) && !(await exists(src))) return
    if (!(await exists(src))) return
    await pipeline(sharp(src)).toFile(dest)
    console.log(`✓ ${rel(src)} (${await kb(src)} КБ) -> ${rel(dest)} (${await kb(dest)} КБ)`)
}

// плашки: 380×185, прозрачность сохраняется
const nominationsDir = path.join(root, 'public/media/nominations')
for (const file of (await readdir(nominationsDir)).filter((f) => f.endsWith('.png'))) {
    const src = path.join(nominationsDir, file)
    await convert(src, src.replace(/\.png$/, '.webp'), (img) => img.webp({quality: 88, effort: 5}))
    await rm(src)
}

await convert(
    path.join(root, 'src/assets/prime-logo.png'),
    path.join(root, 'src/assets/prime-logo.webp'),
    (img) => img.resize({width: 1200, withoutEnlargement: true}).webp({quality: 90, effort: 5}),
)

await convert(
    path.join(root, 'src/assets/hero-bg.png'),
    path.join(root, 'public/media/video/main-background-poster.webp'),
    (img) => img.resize({width: 1600, withoutEnlargement: true}).webp({quality: 78, effort: 5}),
)
