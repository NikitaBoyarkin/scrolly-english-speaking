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
