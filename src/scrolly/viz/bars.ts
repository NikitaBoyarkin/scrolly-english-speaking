import * as d3 from 'd3';
import { prepareSvg, estimateTextWidth, clampX, animMs } from './shared';

interface BarItem {
  label: string;
  value: number;
  max: number;
  unit: string;
  color: string;
}

export function render(mountId: string, props: { items?: BarItem[] }) {
  const prepared = prepareSvg(mountId);
  if (!prepared) return;
  const { svg, width, height } = prepared;

  const items = props?.items || [];
  if (items.length === 0) return;

  const margin = { top: 24, right: 64, bottom: 24, left: 120 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

  const yScale = d3
    .scaleBand()
    .domain(items.map((d) => d.label))
    .range([0, innerH])
    .padding(0.35);
  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(items, (d) => d.max) || 100])
    .range([0, innerW]);

  g.selectAll('rect.track')
    .data(items)
    .join('rect')
    .attr('class', 'track')
    .attr('x', 0)
    .attr('y', (d) => yScale(d.label) || 0)
    .attr('width', (d) => xScale(d.max))
    .attr('height', yScale.bandwidth())
    .attr('rx', yScale.bandwidth() / 2)
    .attr('fill', 'var(--border)');

  g.selectAll('rect.bar')
    .data(items)
    .join('rect')
    .attr('class', 'bar')
    .attr('x', 0)
    .attr('y', (d) => yScale(d.label) || 0)
    .attr('width', 0)
    .attr('height', yScale.bandwidth())
    .attr('rx', yScale.bandwidth() / 2)
    .attr('fill', (d) => d.color)
    .transition()
    .duration(animMs(700))
    .attr('width', (d) => xScale(d.value));

  g.selectAll('text.label')
    .data(items)
    .join('text')
    .attr('class', 'label')
    .attr('x', -10)
    .attr('y', (d) => (yScale(d.label) || 0) + yScale.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'end')
    .attr('font-size', '0.74rem')
    .attr('font-weight', '600')
    .attr('fill', 'var(--ink)')
    .text((d) => d.label);

  g.selectAll('text.value')
    .data(items)
    .join('text')
    .attr('class', 'value')
    .attr('x', (d) =>
      clampX(xScale(d.value) + 6, estimateTextWidth(`${d.value} ${d.unit}`, 11.5), innerW),
    )
    .attr('y', (d) => (yScale(d.label) || 0) + yScale.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('font-size', '0.72rem')
    .attr('font-weight', '700')
    .attr('fill', 'var(--ink)')
    .text((d) => `${d.value} ${d.unit}`);

  // Percent-of-max marker, under the value (goal hint).
  g.selectAll('text.pct')
    .data(items)
    .join('text')
    .attr('class', 'pct')
    .attr('x', (d) =>
      clampX(
        xScale(d.value) + 6,
        estimateTextWidth(`${Math.round((d.value / d.max) * 100)}%`, 9.6),
        innerW,
      ),
    )
    .attr('y', (d) => (yScale(d.label) || 0) + yScale.bandwidth() / 2)
    .attr('dy', '1.6em')
    .attr('font-size', '0.6rem')
    .attr('fill', 'var(--ink-secondary)')
    .text((d) => `${Math.round((d.value / d.max) * 100)}% от нормы`);
}
