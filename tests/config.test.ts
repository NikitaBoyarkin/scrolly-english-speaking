import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { scrollyPageConfigSchema, VIZ_KEYS } from '../src/scrolly/config.schema';

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, '..', 'src', 'scrolly', 'data');
const postsDir = join(here, '..', 'src', 'posts', 'scrolly');

interface DataModule {
  config?: { configId?: string };
}

async function loadDataConfigs(): Promise<{ file: string; config: unknown }[]> {
  const files = readdirSync(dataDir).filter((f) => f.endsWith('.ts'));
  const out: { file: string; config: unknown }[] = [];
  for (const f of files) {
    const mod = (await import(pathToFileURL(join(dataDir, f)).href)) as DataModule;
    if (mod?.config) out.push({ file: f, config: mod.config });
  }
  return out;
}

/** Extract `configId` from an MDX file's YAML frontmatter without importing it
 * (MDX imports an .astro component, which vitest cannot compile). */
function readConfigId(mdxFile: string): string | undefined {
  const text = readFileSync(join(postsDir, mdxFile), 'utf8');
  const fm = text.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return undefined;
  const m = fm[1].match(/^configId:\s*["']?([^"'\s]+)["']?\s*$/m);
  return m ? m[1] : undefined;
}

describe('A1 — every data config satisfies the schema', () => {
  it('all data modules parse cleanly', async () => {
    const configs = await loadDataConfigs();
    expect(configs.length).toBeGreaterThan(0);
    for (const { file, config } of configs) {
      const res = scrollyPageConfigSchema.safeParse(config);
      if (!res.success) {
        throw new Error(
          `${file}: ${res.error.issues.map((i) => i.path.join('.') + ' ' + i.message).join('; ')}`,
        );
      }
    }
  });

  it('every viz.key is a registered renderer', async () => {
    const configs = await loadDataConfigs();
    for (const { file, config } of configs) {
      const parsed = scrollyPageConfigSchema.parse(config);
      for (const s of parsed.sections) {
        if (s.viz) {
          expect(VIZ_KEYS, `${file}: section ${s.id} has unknown viz key`).toContain(s.viz.key);
        }
      }
    }
  });

  it('section ids are unique within a config', async () => {
    const configs = await loadDataConfigs();
    for (const { file, config } of configs) {
      const parsed = scrollyPageConfigSchema.parse(config);
      const ids = parsed.sections.map((s) => s.id);
      expect(new Set(ids).size, `${file}: duplicate section ids`).toBe(ids.length);
    }
  });
});

describe('A4 — every data config has a matching MDX story and vice versa', () => {
  it('configIds and MDX frontmatter are 1:1', async () => {
    const configs = await loadDataConfigs();
    const dataIds = new Set(configs.map((c) => (c.config as { configId: string }).configId));

    const mdxFiles = readdirSync(postsDir).filter((f) => f.endsWith('.mdx'));
    const storyIds = new Map<string, string>();
    for (const f of mdxFiles) {
      const id = readConfigId(f);
      if (id) storyIds.set(id, f);
    }
    const mdxIds = new Set(storyIds.keys());

    // every data config is referenced by some MDX
    for (const id of dataIds) {
      expect(mdxIds, `data config "${id}" has no matching MDX`).toContain(id);
    }
    // every MDX references a real data config
    for (const [id, file] of storyIds) {
      expect(dataIds, `MDX ${file} references unknown configId "${id}"`).toContain(id);
    }
  });
});
