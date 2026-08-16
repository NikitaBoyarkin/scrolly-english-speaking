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
