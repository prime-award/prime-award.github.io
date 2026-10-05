// Скачивает картинки фрейма "все персонажи" из Figma в src/assets/streamers
// (ссылки временные, живут ~7 дней — после этого нужно получить новые).
// Если ссылки истекли — экспортируйте слои вручную в src/assets/streamers с теми же именами.
import { mkdirSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'

const B = 'https://www.figma.com/api/mcp/asset/'
const OUT_DIR = 'src/assets/streamers'
const assets = {
  'arrowwoods.png': B + '202c6392-fc9b-43c1-bbde-bfd71b8838e3.png',
  'bratishkinoff.png': B + '135c5518-da8e-4b89-91f2-9e6c218c2019.png',
  'dedbaldesh.png': B + 'e960ddb8-06b4-40fb-ba12-b9ffdcb5c449.png',
  'rectangle-1.png': B + '7f972229-41bd-4813-bb2b-1f075eca85f4.png',
  'rectangle-2.png': B + '96b51dcb-8d91-4fcc-ba86-5f1bad4c2973.png',
  'alinarin.png': B + 'f015a2f9-e0bd-4b7c-a1fc-562982b00108.png',
  'rectangle-3.png': B + '9401db63-3a70-463e-8743-5f451a7bdae4.png',
  'buster.png': B + 'bdc7c1a1-abf9-4ed7-93a6-28b2db76d53e.png',
  'dunduk.png': B + 'd7fd62c4-681a-442e-a7a0-20b39caad9dc.png',
  'guit88man.png': B + 'ecec1281-bb3f-4aaf-992d-fd7334a5b509.png',
  'itpedia.png': B + 'e695492f-9f68-4b15-8bdc-e64b041b7aae.png',
  'kuplinovplay.png': B + '46f9baf3-0743-40ac-8929-cc9119d720af.png',
  'lyasyaa.png': B + 'fdad879a-404d-4aba-9ae2-63b026d25ebd.png',
  'melharucos.png': B + '9c583d4a-d9a4-4dc7-8ea5-6a48a59fe47c.png',
  'nenormova.png': B + '7b9fad7e-76ef-4725-a9e1-59fb02f56600.png',
  'praden.png': B + 'b2e39dc4-41c7-47c6-89b6-1e00eb862d86.png',
  'segall.png': B + 'ad4f3f2b-c340-469d-9648-75ed9d5518a8.png',
  'gladiatorpwnz.png': B + 'be1f2f62-1af0-4cca-9178-d10f8d1735bc.png',
  'vanomas.png': B + '48f22420-ad8a-48f3-939e-0e05347ac2e4.png',
  'voodoosh.png': B + 'b35a4b9f-6ffa-447e-b7ee-d706cbb92dcb.png',
  'welovegames.png': B + 'c92d6db9-c493-4c98-9aa5-435640d010eb.png',
  'welovegames-2.png': B + '01f9e76a-3d35-47c6-922c-b5fc6b8e4911.png', // новый слой 110:4
}

mkdirSync(OUT_DIR, { recursive: true })

// Все файлы качаются параллельно, существующие перезаписываются
await Promise.all(
    Object.entries(assets).map(async ([name, url]) => {
      const path = `${OUT_DIR}/${name}`
      try {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        await writeFile(path, Buffer.from(await res.arrayBuffer()))
        console.log('✓', name)
      } catch (e) {
        console.error(`✗ ${name}: ${e.message}. Экспортируйте слой из Figma вручную в ${path}`)
        process.exitCode = 1
      }
    }),
)
