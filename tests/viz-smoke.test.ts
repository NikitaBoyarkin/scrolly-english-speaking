import { describe, it, expect } from 'vitest';
import { scrollyPageConfigSchema, VIZ_KEYS } from '../src/scrolly/config.schema';
import { config } from '../src/scrolly/data/english-speaking';

// Lazy-import each renderer (mirrors the runtime's dynamic import map). `any`
// props keep the map assignable across the per-renderer prop types (TS would
// otherwise reject specific prop types as contravariant vs `unknown`).
const RENDERER_MODULES: Record<string, () => Promise<{ render: (...args: any[]) => void }>> = {
  workflow: () => import('../src/scrolly/viz/workflow'),
  tools: () => import('../src/scrolly/viz/tools'),
  bars: () => import('../src/scrolly/viz/bars'),
  resources: () => import('../src/scrolly/viz/resources'),
  metrics: () => import('../src/scrolly/viz/metrics'),
  outcomes: () => import('../src/scrolly/viz/outcomes'),
  cefr: () => import('../src/scrolly/viz/cefr'),
  quiz: () => import('../src/scrolly/viz/quiz'),
  calendar: () => import('../src/scrolly/viz/calendar'),
  checklist: () => import('../src/scrolly/viz/checklist'),
};

/** happy-dom reports a zero-size rect by default; every renderer early-returns
 * on that. Stub a realistic viewport so the chart actually renders. */
function fakeRect(): DOMRect {
  return {
    x: 0,
    y: 0,
    top: 0,
    right: 800,
    bottom: 600,
    left: 0,
    width: 800,
    height: 600,
    toJSON() {},
  } as DOMRect;
}

describe('E2 — viz renderers render without throwing', () => {
  const parsed = scrollyPageConfigSchema.parse(config);

  it('every section viz key maps to a registered renderer', () => {
    for (const s of parsed.sections) {
      if (s.viz) {
        expect(RENDERER_MODULES[s.viz.key], `no renderer for key "${s.viz.key}"`).toBeDefined();
      }
    }
  });

  for (const s of parsed.sections) {
    if (!s.viz) continue;
    // Capture outside the it() closure: TS won't keep the `s.viz` narrowing inside
    // the nested callback, but a const alias is stable.
    const viz = s.viz;
    it(`renders "${viz.key}" (section "${s.id}")`, async () => {
      const mountId = `chart-${s.id}`;
      const el = document.createElement(viz.mount === 'div' ? 'div' : 'svg');
      el.id = mountId;
      // d3's prepareSvg / checklist both call getBoundingClientRect; override on the instance.
      el.getBoundingClientRect = fakeRect;
      document.body.appendChild(el);
      try {
        const mod = await RENDERER_MODULES[viz.key]();
        expect(() => mod.render(mountId, viz.props)).not.toThrow();
        if (viz.mount === 'div') {
          // div-mount renderers (e.g. quiz) build DOM children instead of SVG.
          expect(
            el.children.length,
            `${viz.key} (div mount) did not render content`,
          ).toBeGreaterThan(0);
        } else {
          // svg-mount renderer proceeded past the size guard: it set a viewBox.
          expect(el.getAttribute('viewBox'), `${viz.key} did not set viewBox`).toBeTruthy();
        }
      } finally {
        el.remove();
      }
    });
  }

  it('every renderer used by a section is present in the map', () => {
    const used = new Set(parsed.sections.map((s) => s.viz?.key).filter(Boolean) as string[]);
    for (const key of VIZ_KEYS) {
      if (used.has(key)) {
        expect(RENDERER_MODULES[key], `used renderer "${key}" missing from map`).toBeDefined();
      }
    }
  });
});
