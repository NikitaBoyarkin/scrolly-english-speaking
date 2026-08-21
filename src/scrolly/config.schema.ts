/**
 * Zod schema for `ScrollyPageConfig` — the shape every `src/scrolly/data/*.ts`
 * module must satisfy. Bound by `tests/config.test.ts`: when a config breaks
 * the contract, the test goes red instead of shipping a broken story.
 *
 * This mirrors the hand-written interfaces in `ScrollyLayout.astro`. The schema
 * is the authoritative, executable contract; the interfaces remain for the
 * Astro build's type-check. Import only in tests (zod is a devDependency and
 * must not ship to the browser bundle).
 */
import { z } from 'zod';

/** The set of viz renderers registered in `scrolly-runtime.ts`. Adding a new
 * renderer means extending this enum AND the runtime map. */
export const VIZ_KEYS = [
  'workflow',
  'tools',
  'bars',
  'resources',
  'metrics',
  'outcomes',
  'cefr',
  'quiz',
  'calendar',
  'checklist',
] as const;

export const scrollyPageConfigSchema = z.object({
  configId: z.string().min(1),
  metadata: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    brand: z.string().optional(),
    homeNavUrl: z.string().optional(),
  }),
  hero: z.object({
    label: z.string().optional(),
    titleHtml: z.string().optional(),
    subtitleHtml: z.string().optional(),
    authorsHtml: z.string().optional(),
    teaserHtml: z.string().optional(),
    ctaHref: z.string().optional(),
    stats: z
      .array(z.object({ target: z.number(), unit: z.string(), label: z.string() }))
      .optional(),
  }),
  sections: z.array(
    z.object({
      id: z.string().min(1),
      navLabel: z.string(),
      mobileLabel: z.string().optional(),
      viz: z
        .object({
          key: z.enum(VIZ_KEYS),
          title: z.string(),
          mount: z.enum(['svg', 'div']),
          props: z.unknown().optional(),
          legend: z.array(z.object({ label: z.string(), color: z.string() })).optional(),
          captionHtml: z.string().optional(),
        })
        .optional(),
    }),
  ),
  theme: z.object({
    accent: z.string().optional(),
    paper: z.string().optional(),
    paperDark: z.string().optional(),
    ink: z.string().optional(),
    secondary: z.string().optional(),
  }),
  footerHtml: z.string().optional(),
});

export type ScrollyPageConfig = z.infer<typeof scrollyPageConfigSchema>;

export function parseScrollyConfig(config: unknown): ScrollyPageConfig {
  return scrollyPageConfigSchema.parse(config);
}
