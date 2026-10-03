// Скачивает картинки из Figma (ссылки временные, живут ~7 дней).
// Если ссылки истекли — экспортируйте слои вручную в src/assets с теми же именами.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'

const B = 'https://www.figma.com/api/mcp/asset/'
const assets = {
  'hero-bg.png': B + '83c42725-19e7-437b-8517-8a0e3fb97f72.png',
  'prime-logo.png': B + '541b1178-8d7a-41e1-b23a-02492ea6dea1.png',
  'person-1.png': B + '4aef2144-edd4-4e44-9548-e09d186a7dac.png',
  'person-2.png': B + 'cbc31adf-71ee-4d8f-a622-663289068331.png',
  'person-3.png': B + '227f648b-c9aa-4f1d-8cd5-15643c3c4e88.png',
  'person-4.png': B + 'c45af44f-367c-4d1c-bbe6-528531d16d05.png',
  'balcony-logo.png': B + 'e6adf047-7970-4747-a58d-505c8023c0b9.png',
  'balcony-text.svg': B + 'a4f345b1-afd7-4a2e-9515-65162397f6db.svg',
  'steam-logo.png': B + 'cee55de4-ca51-4f32-8456-2e7585e95852.png',
  'steamlvlup-text.png': B + 'c74ef795-f7fa-43f9-9c3d-d96fc701b2c6.png',
  'geek-logo.png': B + 'c07c732c-7eb8-47e6-a769-77ed77f3f664.png',
  'geek-text.svg': B + 'c77a139c-e13d-4848-a5ba-00163891f979.svg',
}

mkdirSync('src/assets', { recursive: true })
for (const [name, url] of Object.entries(assets)) {
  const path = `src/assets/${name}`
  if (existsSync(path)) continue
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    writeFileSync(path, Buffer.from(await res.arrayBuffer()))
    console.log('✓', name)
  } catch (e) {
    console.error(`✗ ${name}: ${e.message}. Экспортируйте слой из Figma вручную в ${path}`)
    process.exitCode = 1
  }
}
