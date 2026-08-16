/**
 * Shared types for the scrollytelling engine.
 *
 * The authoritative shape is the Zod schema in `config.schema.ts` (bound by
 * `tests/config.test.ts`). These types are derived from it via `z.infer` and
 * re-exported here so the Astro layout and runtime type-check against the same
 * contract WITHOUT shipping zod to the browser bundle — `import type` is
 * erased at build time.
 */
import type { ScrollyPageConfig } from './config.schema';

export type { ScrollyPageConfig };
export type ScrollyMetadata = ScrollyPageConfig['metadata'];
export type ScrollyHero = ScrollyPageConfig['hero'];
export type ScrollySectionConfig = ScrollyPageConfig['sections'][number];
export type ScrollyViz = NonNullable<ScrollySectionConfig['viz']>;
export type ScrollyTheme = ScrollyPageConfig['theme'];

/** MDX frontmatter — the only part of a story that may override the trusted
 * data module. Hero HTML, sections and footer always come from the data module. */
export interface ScrollyFrontmatter {
  configId?: string;
  metadata?: ScrollyMetadata;
  theme?: ScrollyTheme;
}
