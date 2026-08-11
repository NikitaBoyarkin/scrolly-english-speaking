import * as d3 from 'd3';
import { prepareSvg } from './shared';

interface Metric {
  label: string;
  value: number;
  target: number;
  unit: string;
}

export function render(mountId: string, props: { metrics?: Metric[] }) {
  const prepared = prepareSvg(mountId);
  if (!prepared) return;
  const { svg, width, height } = prepared;

  const metrics = props?.metrics || [];
  if (metrics.length === 0) return;

  const margin = { top: 24, right: 72, bottom: 24, left: 150 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

  const yScale = d3.scaleBand().domain(metrics.map((d) => d.label)).range([0, innerH]).padding(0.4);
  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(metrics, (d) => Math.max(d.value, d.target)) || 100])
    .range([0, innerW])
    .nice();

  g.selectAll('line.target')
    .data(metrics)
    .join('line')
    .attr('class', 'target')
    .attr('x1', (d) => xScale(d.target))
    .attr('x2', (d) => xScale(d.target))
    .attr('y1', (d) => yScale(d.label) || 0)
    .attr('y2', (d) => (yScale(d.label) || 0) + yScale.bandwidth())
    .attr('stroke', 'var(--ink-secondary)')
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '4 2');

  g.selectAll('rect.bar')
    .data(metrics)
    .join('rect')
    .attr('class', 'bar')
    .attr('x', 0)
    .attr('y', (d) => yScale(d.label) || 0)
    .attr('width', 0)
    .attr('height', yScale.bandwidth())
    .attr('rx', 4)
    .attr('fill', (d) => (d.value >= d.target * 0.9 ? '#06d6a0' : 'var(--accent)'))
    .transition()
    .duration(700)
    .attr('width', (d) => xScale(d.value));

  g.selectAll('text.label')
    .data(metrics)
    .join('text')
    .attr('class', 'label')
    .attr('x', -10)
    .attr('y', (d) => (yScale(d.label) || 0) + yScale.bandwidth() / 2)
    .attr('dy', '-0.2em')
    .attr('text-anchor', 'end')
    .attr('font-size', '0.7rem')
    .attr('font-weight', '600')
    .attr('fill', 'var(--ink)')
    .text((d) => d.label);

  g.selectAll('text.sub')
    .data(metrics)
    .join('text')
    .attr('class', 'sub')
    .attr('x', -10)
    .attr('y', (d) => (yScale(d.label) || 0) + yScale.bandwidth() / 2)
    .attr('dy', '1em')
    .attr('text-anchor', 'end')
    .attr('font-size', '0.6rem')
    .attr('fill', 'var(--ink-secondary)')
    .text((d) => `цель: ${d.target}${d.unit}`);

  g.selectAll('text.value')
    .data(metrics)
    .join('text')
    .attr('class', 'value')
    .attr('x', (d) => xScale(d.value) + 6)
    .attr('y', (d) => (yScale(d.label) || 0) + yScale.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('font-size', '0.72rem')
    .attr('font-weight', '700')
    .attr('fill', 'var(--ink)')
    .text((d) => `${d.value}${d.unit}`);
}
