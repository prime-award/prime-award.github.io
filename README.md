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

## Деплой на GitHub Pages (GitHub Actions)

Перед первым пушем скачайте картинки и **закоммитьте их** (`src/assets/*.png`), а также файл шрифта
в `public/fonts/` — ссылки Figma временные, и в CI скачать картинки не получится.

```bash
npm run assets
git init && git add . && git commit -m "init"
git branch -M main
git remote add origin git@github.com:<user>/<repo>.git
git push -u origin main
```

В репозитории: Settings → Pages → Source: **GitHub Actions**.
Дальше каждый пуш в `main` сам собирает и публикует сайт (`.github/workflows/deploy.yml`).
Первый запуск можно сделать вручную: вкладка Actions → Deploy to GitHub Pages → Run workflow.

Сайт будет доступен по адресу `https://<user>.github.io/<repo>/`.
