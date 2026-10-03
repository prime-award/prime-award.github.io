# PRIME 2026 — лендинг (Vue 3 + Vite)

```bash
npm install
npm run assets   # скачать картинки из Figma (также запускается автоматически перед dev/build)
npm run dev
```

## Шрифт заголовков
Заголовки используют **Foglihten No06**. Положите файл шрифта в `public/fonts/`
как `FoglihtenNo06.woff2` (или `.otf` / `.ttf`). Пока файла нет, используется запасной serif.

Inter подключён через `@fontsource/inter`.

## Картинки
Ссылки Figma временные (7 дней). Если скрипт не скачал файлы, экспортируйте слои из Figma
в `src/assets/` с именами: `logo.png`, `nominee-1.png` … `nominee-4.png`.
