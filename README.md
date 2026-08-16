# Scrolly English Speaking

Scrollytelling-гайд по улучшению spoken English для рабочих разговоров (уровень A2–B1).
Построен на Astro: data-driven конфиг + MDX-нарратив + D3-визуализации, деплой на GitHub Pages.

**Живая страница:** https://nikitaboyarkin.github.io/scrolly-english-speaking/english-speaking

## Стек

- **Astro 6** (`output: static`) + **MDX** + **Tailwind v4** (через `@tailwindcss/vite`)
- **D3 v7** — визуализации (workflow, tools, bars, resources, metrics, calendar, checklist)
- **@astrojs/sitemap**, Shiki (тема `nord`) для кода в MDX
- Деплой: GitHub Pages (subpath `/scrolly-english-speaking/`), Node 22

## Архитектура

```
src/
├── layouts/ScrollyLayout.astro   # единый шаблон: hero, 2-колоночный scrolly, viz-панели, head-мета
├── pages/
│   ├── index.astro               # редирект на единственную историю
│   └── [slug].astro              # getStaticPaths по src/posts/scrolly/*.mdx
├── posts/scrolly/*.mdx           # нарратив (текст разделов)
├── scrolly/
│   ├── data/*.ts                 # configId + секции + viz props + тема (доверенный источник HTML)
│   ├── scrolly-entry.ts          # bootstrap
│   ├── scrolly-runtime.ts        # IntersectionObserver, switchViz, theme-toggle
│   └── viz/*.ts                  # D3-рендереры (lazy import)
├── components/scrolly/
│   ├── ScrollySection.astro      # <section data-section-id>
│   └── style.css                 # вся scrolly-стилистика + dark-theme
└── styles/global.css             # Tailwind + токены + reduced-motion
```

Контент и визуализации разделены: MDX хранит нарратив, `data/*.ts` — структуру секций и props визуализаций.
MDX-frontmatter (`configId`, `metadata`, `theme`) безопасно мёрджится поверх доверенного дата-модуля;
HTML hero/footer всегда берётся из `data/*.ts`, never из frontmatter (защита от инъекций).

## Команды

```bash
npm install
npm run dev          # localhost:4321
npm run build        # dist/
npm run preview
npm run typecheck    # astro check
npm run format       # prettier --write .
```

## Добавить новую историю

1. Создать `src/scrolly/data/<id>.ts` с `export const config = { configId: '<id>', ... }`.
2. Создать `src/posts/scrolly/<id>.mdx` с frontmatter `configId: "<id>"` и `<ScrollySection>` блоками.
3. (Опционально) зарегистрировать новый рендерер в `scrolly-runtime.ts` → `vizRenderers`.
4. `src/pages/index.astro` сейчас хардкодит редирект — для нескольких историй добавить listing-страницу.

## Деплой

Push в `master` триггерит `.github/workflows/astro.yml`: `astro check` → `astro build` → GitHub Pages.
`site` и `base` задаются в CI через `--site`/`--base` (configure-pages).
