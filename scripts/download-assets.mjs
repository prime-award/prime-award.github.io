#!/usr/bin/env node
/**
 * Выгрузка всех изображений из блока (node) Figma-файла.
 *
 * Запуск:
 *   node --env-file=.env scripts/figma-export.mjs                 # оригиналы картинок, без градиентов/задника
 *   node --env-file=.env scripts/figma-export.mjs "<ссылка на блок>" --out=src/assets/figma
 *   node --env-file=.env scripts/figma-export.mjs --rendered --format=png --scale=2   # рендер слоя целиком
 *
 * В .env:  FIGMA_TOKEN=figd_xxx   (Personal access token, scope: file_content:read)
 */
import {mkdir, writeFile} from 'node:fs/promises'
import path from 'node:path'

const DEFAULT_URL =
    'https://www.figma.com/design/BEYwOkIq7KyT3ZkNCu7pta/Untitled?node-id=89-22'

// ---------- аргументы ----------
const args = process.argv.slice(2)
const flag = (name, def) => {
    const a = args.find((x) => x.startsWith(`--${name}=`))
    return a ? a.slice(name.length + 3) : def
}
const url = args.find((a) => a.startsWith('http')) ?? DEFAULT_URL
const FORMAT = flag('format', 'png') // png | jpg | svg | pdf
const SCALE = flag('scale', '2') // 0.01 – 4
const OUT_DIR = flag('out', 'public/figma-images')
// По умолчанию качаем исходные файлы картинок (только Image-заливка, без градиентов и др. заливок слоя).
// Флаг --rendered включает рендер всего слоя целиком (со всеми заливками, обрезкой, эффектами).
const ORIGINAL = !args.includes('--rendered')


if (!TOKEN) {
    console.error('Нет FIGMA_TOKEN. Добавьте его в .env (FIGMA_TOKEN=figd_...)')
    process.exit(1)
}

// ---------- разбор ссылки ----------
const parsed = new URL(url)
const fileKey = parsed.pathname.split('/')[2]
const rawNodeId = parsed.searchParams.get('node-id')
if (!fileKey || !rawNodeId) {
    console.error('Не удалось получить file key / node-id из ссылки')
    process.exit(1)
}
const nodeId = rawNodeId.replace('-', ':') // в URL "89-22", в API "89:22"

// ---------- утилиты ----------
async function api(endpoint, params = {}, attempt = 0) {
    const u = new URL(`https://api.figma.com/v1${endpoint}`)
    Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v))
    const res = await fetch(u, {headers: {'X-Figma-Token': TOKEN}})
    if (res.status === 429 && attempt < 5) {
        const wait = Number(res.headers.get('retry-after') ?? 5) * 1000
        console.log(`Rate limit, ждём ${wait / 1000}с...`)
        await new Promise((r) => setTimeout(r, wait))
        return api(endpoint, params, attempt + 1)
    }
    if (!res.ok) throw new Error(`Figma API ${res.status}: ${await res.text()}`)
    return res.json()
}

const slug = (s) =>
    s
        .toLowerCase()
        .replace(/[^a-z0-9а-яё]+/gi, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60) || 'image'

const chunk = (arr, n) =>
    Array.from({length: Math.ceil(arr.length / n)}, (_, i) => arr.slice(i * n, i * n + n))

async function download(fileUrl) {
    const res = await fetch(fileUrl)
    if (!res.ok) throw new Error(`Не скачалось (${res.status}): ${fileUrl}`)
    return {
        buffer: Buffer.from(await res.arrayBuffer()),
        type: res.headers.get('content-type') ?? '',
    }
}

// Рекурсивно собираем узлы, у которых есть видимая заливка-картинка
function collectImageNodes(node, out = []) {
    const imageFills = (node.fills ?? []).filter((f) => f.type === 'IMAGE' && f.visible !== false)
    if (imageFills.length) {
        out.push({id: node.id, name: node.name, refs: imageFills.map((f) => f.imageRef)})
    }
    node.children?.forEach((c) => collectImageNodes(c, out))
    return out
}

// ---------- основной сценарий ----------
async function main() {
    console.log(`Файл: ${fileKey}, блок: ${nodeId}`)

    const data = await api(`/files/${fileKey}/nodes`, {ids: nodeId})
    const root = data.nodes?.[nodeId]?.document
    if (!root) throw new Error(`Узел ${nodeId} не найден`)

    const nodes = collectImageNodes(root)
    console.log(`Найдено узлов с изображениями: ${nodes.length}`)
    if (!nodes.length) return

    await mkdir(OUT_DIR, {recursive: true})
    const used = new Set()
    const fileName = (node, ext) => {
        const name = slug(node.name)
        let base = name
        // суффикс -2, -3 появляется только если слоёв с одинаковым названием несколько
        for (let i = 2; used.has(base); i++) base = `${name}-${i}`
        used.add(base)
        return `${base}.${ext}`
    }

    if (ORIGINAL) {
        // Оригинальные файлы (как были загружены в Figma)
        const {meta} = await api(`/files/${fileKey}/images`)
        const seen = new Set()
        for (const node of nodes) {
            for (const ref of node.refs) {
                if (seen.has(ref) || !meta.images[ref]) continue
                seen.add(ref)
                const {buffer, type} = await download(meta.images[ref])
                const ext = type.split('/')[1]?.split(';')[0]?.replace('jpeg', 'jpg') || 'png'
                const file = fileName(node, ext)
                await writeFile(path.join(OUT_DIR, file), buffer)
                console.log('✓', file)
            }
        }
        return
    }

    // Рендер узлов (учитывает обрезку, скругления, эффекты)
    const byId = new Map(nodes.map((n) => [n.id, n]))
    for (const ids of chunk([...byId.keys()], 50)) {
        const {images, err} = await api(`/images/${fileKey}`, {
            ids: ids.join(','),
            format: FORMAT,
            scale: SCALE,
        })
        if (err) throw new Error(err)

        for (const id of ids) {
            const link = images[id]
            if (!link) {
                console.warn('✗ не отрендерился:', byId.get(id).name, id)
                continue
            }
            const {buffer} = await download(link)
            const file = fileName(byId.get(id), FORMAT)
            await writeFile(path.join(OUT_DIR, file), buffer)
            console.log('✓', file)
        }
    }
    console.log(`Готово → ${OUT_DIR}`)
}

main().catch((e) => {
    console.error(e.message)
    process.exit(1)
})
