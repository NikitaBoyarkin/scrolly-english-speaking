import * as d3 from 'd3';
import { prepareSvg, estimateTextWidth } from './shared';
import { resourceTypeColors } from '../data/english-speaking';

interface Resource {
  name: string;
  type: string;
  level: number;
}

export function render(mountId: string, props: { resources?: Resource[] }) {
  const prepared = prepareSvg(mountId);
  if (!prepared) return;
  const { svg, width, height } = prepared;

  const resources = props?.resources || [];
  if (resources.length === 0) return;

  // Left margin adapts to the longest resource name so labels never clip.
  const nameFontPx = 10.5; // 0.66rem
  const longestName = d3.max(resources, (d) => d.name.length) || 0;
  const margin = {
    top: 24,
    right: 16,
    bottom: 40,
    left: Math.min(200, estimateTextWidth('W'.repeat(longestName), nameFontPx) + 20),
  };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const levelLabels: Record<number, string> = { 1: 'A2', 2: 'B1', 3: 'B2' };

  const xScale = d3.scaleLinear().domain([1, 3]).range([0, innerW]).nice();
  const yScale = d3
    .scaleBand()
    .domain(resources.map((d) => d.name))
    .range([0, innerH])
    .padding(0.25);

  const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

  g.append('g')
    .attr('transform', `translate(0, ${innerH})`)
    .call(
      d3
        .axisBottom(xScale)
        .ticks(3)
        .tickFormat((d) => levelLabels[Number(d)] ?? ''),
    )
    .call((s) =>
      s.selectAll('text').attr('font-size', '0.7rem').attr('fill', 'var(--ink-secondary)'),
    );

  g.append('text')
    .attr('x', innerW / 2)
    .attr('y', innerH + 34)
    .attr('text-anchor', 'middle')
    .attr('font-size', '0.72rem')
    .attr('fill', 'var(--ink)')
    .text('Уровень →');

  g.append('g')
    .call(
      d3
        .axisBottom(xScale)
        .ticks(3)
        .tickSize(-innerH)
        .tickFormat(() => ''),
    )
    .call((s) => s.selectAll('line').attr('stroke', 'var(--border)'))
    .call((s) => s.selectAll('path').remove());

  g.selectAll('circle')
    .data(resources)
    .join('circle')
    .attr('cx', (d) => xScale(d.level))
    .attr('cy', (d) => (yScale(d.name) || 0) + yScale.bandwidth() / 2)
    .attr('r', 0)
    .attr('fill', (d) => resourceTypeColors[d.type] || '#9ca3af')
    .attr('stroke', 'var(--paper)')
    .attr('stroke-width', 2)
    .transition()
    .duration(500)
    .attr('r', 7);

  g.selectAll('text.name')
    .data(resources)
    .join('text')
    .attr('class', 'name')
    .attr('x', -10)
    .attr('y', (d) => (yScale(d.name) || 0) + yScale.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'end')
    .attr('font-size', '0.66rem')
    .attr('fill', 'var(--ink)')
    .text((d) => d.name);
}
