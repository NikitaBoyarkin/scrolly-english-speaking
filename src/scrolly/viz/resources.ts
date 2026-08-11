import * as d3 from 'd3';
import { prepareSvg } from './shared';

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

  const margin = { top: 24, right: 16, bottom: 40, left: 140 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const colorMap: Record<string, string> = {
    Podcast: '#2563eb',
    YouTube: '#dc2626',
    Newsletter: '#06d6a0',
    'Docs / Course': '#7c3aed',
  };

  const xScale = d3.scaleLinear().domain([1, 3]).range([0, innerW]).nice();
  const yScale = d3
    .scaleBand()
    .domain(resources.map((d) => d.name))
    .range([0, innerH])
    .padding(0.25);

  const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

  g.append('g')
    .attr('transform', `translate(0, ${innerH})`)
    .call(d3.axisBottom(xScale).ticks(3).tickFormat((d) => (d === 1 ? 'A2' : d === 2 ? 'B1' : 'B2')))
    .call((s) => s.selectAll('text').attr('font-size', '0.7rem').attr('fill', 'var(--ink-secondary)'));

  g.append('text')
    .attr('x', innerW / 2)
    .attr('y', innerH + 34)
    .attr('text-anchor', 'middle')
    .attr('font-size', '0.72rem')
    .attr('fill', 'var(--ink)')
    .text('Уровень →');

  g.append('g')
    .call(d3.axisBottom(xScale).ticks(3).tickSize(-innerH).tickFormat(() => ''))
    .call((s) => s.selectAll('line').attr('stroke', 'var(--border)'))
    .call((s) => s.selectAll('path').remove());

  g.selectAll('circle')
    .data(resources)
    .join('circle')
    .attr('cx', (d) => xScale(d.level))
    .attr('cy', (d) => (yScale(d.name) || 0) + yScale.bandwidth() / 2)
    .attr('r', 0)
    .attr('fill', (d) => colorMap[d.type] || '#9ca3af')
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
