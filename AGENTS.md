# AGENTS.md — scrolly-english-speaking

Scrollytelling-гайд по spoken English для работы (A2–B1). Astro 6 (static) + MDX + D3 v7 + Tailwind v4, деплой на GitHub Pages (subpath `/scrolly-english-speaking/`). Живая страница: `https://nikitaboyarkin.github.io/scrolly-english-speaking/english-speaking`.

## Команды

```bash
npm run dev          # localhost:4321
npm run test         # vitest (happy-dom)
npm run typecheck    # astro check
npm run format       # prettier --write .
npm run format:check
npm run build        # dist/
```

Все проверки гоняются в CI (`.github/workflows/astro.yml`) — перед коммитом: `npm run test && npm run typecheck && npm run format:check`.

## Архитектура (не сломай тройное разделение)

- `src/scrolly/data/*.ts` — **доверенный источник** структуры: `configId`, hero-HTML, секции с `viz.key`/`viz.props`, footer-HTML. MDX-frontmatter НЕ может переопределить hero/sections/footer — только `metadata` и `theme` (см. `merge.ts`).
- `src/posts/scrolly/*.mdx` — только нарратив: `<ScrollySection id="...">` блоки. Каждый `id` обязан существовать в data-конфиге (тест `tests/config.test.ts`).
- `src/scrolly/viz/*.ts` — D3-рендереры, lazy-import из `scrolly-runtime.ts`. Новый рендерер = добавить ключ в `VIZ_KEYS` (`config.schema.ts`) + в map `scrolly-runtime.ts`.

## Конвенции

- Конфиг валидируется zod-схемой (`config.schema.ts`); любое изменение shape = обновить и схему, и тесты.
- Pure-логика (storage, подсчёты) живёт в `*-state.ts` с инъектируемым `StorageLike` и юнит-тестами — не совай `localStorage`/DOM в чистые функции.
- D3-переходы гейтятся через `animMs`/`animDelay` из `shared.ts` (уважение `prefers-reduced-motion`); не пиши голые `.duration(500)`.
- Внешние URL — из `src/scrolly/site.ts` (`SITE.*`), не хардкодь в layout/data.
- Общий head — `src/components/Head.astro`; стори-стили — `style.css` (токены) + `listing.css` (листинг).
- Язык: контент на русском, код/комментарии кода — английский.

## Тесты

- `config.test.ts` — schema-контракт, `configId` 1:1, section-id 1:1 между MDX и data.
- `runtime.test.ts` — рантайм-связка (IntersectionObserver, nav-dots, hash, reset).
- `viz-smoke.test.ts` — каждый рендерер рендерится без throw на фейковом viewport.
- `*-state.test.ts` — чистая логика (quiz/checklist storage).
