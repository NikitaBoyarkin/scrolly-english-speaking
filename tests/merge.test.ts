import { describe, it, expect } from 'vitest';
import { mergePageConfig } from '../src/scrolly/merge';
import { config } from '../src/scrolly/data/english-speaking';
import { scrollyPageConfigSchema } from '../src/scrolly/config.schema';

const base = scrollyPageConfigSchema.parse(config);

describe('mergePageConfig — safe merge of frontmatter over the data module', () => {
  it('metadata and theme override shallowly, base fills the rest', () => {
    const merged = mergePageConfig(base, {
      metadata: { title: 'Custom title' },
      theme: { accent: '#ff0000' },
    });
    expect(merged.metadata.title).toBe('Custom title');
    expect(merged.metadata.description).toBe(base.metadata.description);
    expect(merged.theme.accent).toBe('#ff0000');
    expect(merged.theme.paper).toBe(base.theme.paper);
  });

  it('undefined frontmatter returns base untouched', () => {
    const merged = mergePageConfig(base, undefined);
    expect(merged.metadata).toEqual(base.metadata);
    expect(merged.theme).toEqual(base.theme);
  });

  it('empty frontmatter object is a no-op', () => {
    const merged = mergePageConfig(base, {});
    expect(merged.metadata).toEqual(base.metadata);
    expect(merged.theme).toEqual(base.theme);
  });

  it('the merge result exposes no hero/sections/footer surface', () => {
    // The layout reads hero/sections/footerHtml straight from the data module;
    // the merge function is the only frontmatter→config channel and it is
    // closed to those keys, so frontmatter cannot inject markup.
    const merged = mergePageConfig(base, { metadata: { title: 'x' } });
    expect(Object.keys(merged).sort()).toEqual(['metadata', 'theme']);
    expect('hero' in merged).toBe(false);
    expect('sections' in merged).toBe(false);
    expect('footerHtml' in merged).toBe(false);
  });
});
