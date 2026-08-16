import type { ScrollyFrontmatter, ScrollyPageConfig } from './types';

export interface MergedPageConfig {
  metadata: ScrollyPageConfig['metadata'];
  theme: ScrollyPageConfig['theme'];
}

/**
 * Safe merge of MDX frontmatter over the trusted data module.
 *
 * Only plain-text `metadata` and `theme` may be overridden. Hero HTML, sections
 * and footer HTML are NOT part of the merge — the layout reads those straight
 * from the data module, so a compromised frontmatter cannot inject markup.
 * Bound by `tests/merge.test.ts`.
 */
export function mergePageConfig(
  base: ScrollyPageConfig,
  frontmatter: ScrollyFrontmatter | undefined,
): MergedPageConfig {
  return {
    metadata: { ...base.metadata, ...(frontmatter?.metadata || {}) },
    theme: { ...base.theme, ...(frontmatter?.theme || {}) },
  };
}
