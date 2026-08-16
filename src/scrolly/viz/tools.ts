import * as d3 from 'd3';
import { prepareSvg } from './shared';
import { toolTierColors } from '../data/english-speaking';

interface Tool {
  name: string;
  price: number;
  businessScore: number;
  tier: string;
}

export function render(mountId: string, props: { tools?: Tool[] }) {
  const prepared = prepareSvg(mountId);
  if (!prepared) return;
  const { svg, width, height } = prepared;

  const tools = props?.tools || [];
  if (tools.length === 0) return;

  const margin = { top: 24, right: 24, bottom: 48, left: 60 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const BUSINESS_SCORE_MAX = 10;
  const yMax = Math.ceil((d3.max(tools, (d) => d.price) || 0) * 1.3);

  const xScale = d3.scaleLinear().domain([0, BUSINESS_SCORE_MAX]).nice().range([0, innerW]);
  const yScale = d3.scaleLinear().domain([0, yMax]).nice().range([innerH, 0]);

  const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

  g.append('g')
    .attr('class', 'x-grid')
    .attr('transform', `translate(0, ${innerH})`)
    .call(
      d3
        .axisBottom(xScale)
        .ticks(5)
        .tickSize(-innerH)
        .tickFormat(() => ''),
    )
    .call((s) => s.selectAll('line').attr('stroke', 'var(--border)'))
    .call((s) => s.selectAll('path').remove());

  g.append('g')
    .attr('class', 'y-grid')
    .call(
      d3
        .axisLeft(yScale)
        .ticks(5)
        .tickSize(-innerW)
        .tickFormat(() => ''),
    )
    .call((s) => s.selectAll('line').attr('stroke', 'var(--border)'))
    .call((s) => s.selectAll('path').remove());

  g.append('g')
    .attr('transform', `translate(0, ${innerH})`)
    .call(d3.axisBottom(xScale).ticks(5))
    .call((s) =>
      s.selectAll('text').attr('font-size', '0.7rem').attr('fill', 'var(--ink-secondary)'),
    );

  g.append('g')
    .call(
      d3
        .axisLeft(yScale)
        .ticks(5)
        .tickFormat((d) => `$${d}`),
    )
    .call((s) =>
      s.selectAll('text').attr('font-size', '0.7rem').attr('fill', 'var(--ink-secondary)'),
    );

  g.append('text')
    .attr('x', innerW / 2)
    .attr('y', innerH + 38)
    .attr('text-anchor', 'middle')
    .attr('font-size', '0.72rem')
    .attr('fill', 'var(--ink)')
    .text('Бизнес-специфика →');

  g.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -innerH / 2)
    .attr('y', -42)
    .attr('text-anchor', 'middle')
    .attr('font-size', '0.72rem')
    .attr('fill', 'var(--ink)')
    .text('Цена, $/мес →');

  g.selectAll('circle.tool')
    .data(tools)
    .join('circle')
    .attr('class', 'tool')
    .attr('cx', (d) => xScale(d.businessScore))
    .attr('cy', (d) => yScale(d.price))
    .attr('r', 0)
    .attr('fill', (d) => toolTierColors[d.tier] || '#2563eb')
    .attr('opacity', 0.85)
    .attr('stroke', 'var(--paper)')
    .attr('stroke-width', 2)
    .transition()
    .duration(500)
    .attr('r', (d) => (d.tier === 'free' ? 14 : 10));

  g.selectAll('text.label')
    .data(tools)
    .join('text')
    .attr('class', 'label')
    .attr('x', (d) => xScale(d.businessScore))
    .attr('y', (d) => yScale(d.price) - 18)
    .attr('text-anchor', 'middle')
    .attr('font-size', '0.66rem')
    .attr('font-weight', '600')
    .attr('fill', 'var(--ink)')
    .text((d) => d.name);
}
