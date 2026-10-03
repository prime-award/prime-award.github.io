// Скачивает картинки из Figma (ссылки временные, живут 7 дней с момента генерации).
// Если ссылки истекли — экспортируйте слои вручную из Figma в src/assets с теми же именами.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'

const assets = {
  'logo.png': 'https://www.figma.com/api/mcp/asset/71ac593b-4bbb-4dcd-9ee4-201f0b26ee68.png',
  'nominee-1.png': 'https://www.figma.com/api/mcp/asset/bd8e4257-790d-4c69-8eca-51117d31325a.png',
  'nominee-2.png': 'https://www.figma.com/api/mcp/asset/008f41c6-f72d-4554-9086-60a9e9d30d00.png',
  'nominee-3.png': 'https://www.figma.com/api/mcp/asset/f434d37d-a02b-4102-ba61-51e05ab47974.png',
  'nominee-4.png': 'https://www.figma.com/api/mcp/asset/278cb5bf-b85d-44b4-bba2-6a98c5b3c876.png',
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
