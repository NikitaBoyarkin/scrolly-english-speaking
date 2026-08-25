import * as d3 from 'd3';

export interface SvgSize {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  width: number;
  height: number;
}

export interface PrepareSvgOptions {
  /** Interactive widgets: override the layout's role="img" + aria-labelledby
   * with a descriptive aria-label (the per-row instruction matters more than
   * the title). */
  ariaLabel?: string;
}

export function prepareSvg(mountId: string, options: PrepareSvgOptions = {}): SvgSize | null {
  const node = document.getElementById(mountId) as SVGSVGElement | null;
  if (!node) return null;

  node.replaceChildren();
  const svg = d3.select(node);

  if (options.ariaLabel) {
    svg.attr('role', 'group').attr('aria-labelledby', null).attr('aria-label', options.ariaLabel);
  }

  const rect = node.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return null;

  svg
    .attr('viewBox', `0 0 ${rect.width} ${rect.height}`)
    .attr('width', rect.width)
    .attr('height', rect.height);

  return { svg, width: rect.width, height: rect.height };
}

/** Rough text-width estimate for clamping labels inside the chart area.
 * Avoids `getComputedTextLength` (unreliable in jsdom/happy-dom and forces a
 * layout pass); 0.6 × font-size per char is a safe average for latin+cyrillic. */
export function estimateTextWidth(text: string, fontSizePx: number): number {
  return text.length * fontSizePx * 0.6;
}

/** Clamp a label's x so it stays inside [0, innerW] given its width. */
export function clampX(x: number, textWidth: number, innerW: number): number {
  return Math.max(0, Math.min(x, innerW - textWidth));
}

/** Greedy word-wrap into lines that fit maxWidth. Used for SVG labels that
 * would otherwise clip on narrow panels. */
export function wrapText(text: string, maxWidth: number, fontSizePx: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (!line || estimateTextWidth(candidate, fontSizePx) <= maxWidth) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

let reducedMotionCache: boolean | null = null;

/** Whether the user prefers reduced motion. Cached — evaluated once because the
 * preference cannot change within a page lifetime. The CSS-level guard in
 * global.css only covers CSS transitions; D3 drives its own timer-based
 * transitions in JS, so renderers must zero them here too. */
export function prefersReducedMotion(): boolean {
  if (reducedMotionCache === null) {
    reducedMotionCache =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return reducedMotionCache;
}

/** Duration for a D3 transition — 0 under reduced motion (jump straight to the
 * final state instead of animating). */
export function animMs(base: number): number {
  return prefersReducedMotion() ? 0 : base;
}

/** Delay for a D3 transition — 0 under reduced motion so staggered entry
 * animations don't leave elements waiting before they appear. */
export function animDelay(delay: number): number {
  return prefersReducedMotion() ? 0 : delay;
}
