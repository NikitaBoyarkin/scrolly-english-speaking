import * as d3 from 'd3';

export interface SvgSize {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  width: number;
  height: number;
}

export function prepareSvg(mountId: string): SvgSize | null {
  const node = document.getElementById(mountId) as SVGSVGElement | null;
  if (!node) return null;

  const svg = d3.select(node);
  svg.selectAll('*').remove();

  const rect = node.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return null;

  svg.attr('viewBox', `0 0 ${rect.width} ${rect.height}`).attr('width', rect.width).attr('height', rect.height);

  return { svg, width: rect.width, height: rect.height };
}
