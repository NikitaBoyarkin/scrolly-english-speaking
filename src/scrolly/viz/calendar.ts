import * as d3 from 'd3';
import { prepareSvg } from './shared';

interface WeekPlan {
  week: number;
  focus: string;
  speak: number;
  cards: number;
  inputMin: number;
  milestones: string[];
}

export function render(mountId: string, props: { weeks?: WeekPlan[] }) {
  const prepared = prepareSvg(mountId);
  if (!prepared) return;
  const { svg, width, height } = prepared;

  const weeks = props?.weeks || [];
  if (weeks.length === 0) return;

  const margin = { top: 24, right: 24, bottom: 24, left: 40 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

  const yScale = d3
    .scaleBand()
    .domain(weeks.map((d) => `Неделя ${d.week}`))
    .range([0, innerH])
    .padding(0.25);
  const xScale = d3.scaleLinear().domain([0, 60]).range([0, innerW]);

  g.selectAll('rect.bg')
    .data(weeks)
    .join('rect')
    .attr('class', 'bg')
    .attr('x', 0)
    .attr('y', (d) => yScale(`Неделя ${d.week}`) || 0)
    .attr('width', innerW)
    .attr('height', yScale.bandwidth())
    .attr('rx', 8)
    .attr('fill', 'var(--border)')
    .attr('opacity', 0.25);

  g.selectAll('rect.speak')
    .data(weeks)
    .join('rect')
    .attr('class', 'speak')
    .attr('x', 0)
    .attr('y', (d) => (yScale(`Неделя ${d.week}`) || 0) + yScale.bandwidth() * 0.18)
    .attr('width', 0)
    .attr('height', yScale.bandwidth() * 0.28)
    .attr('rx', 4)
    .attr('fill', 'var(--accent)')
    .transition()
    .duration(600)
    .attr('width', (d) => xScale(d.speak));

  g.selectAll('rect.cards')
    .data(weeks)
    .join('rect')
    .attr('class', 'cards')
    .attr('x', 0)
    .attr('y', (d) => (yScale(`Неделя ${d.week}`) || 0) + yScale.bandwidth() * 0.54)
    .attr('width', 0)
    .attr('height', yScale.bandwidth() * 0.28)
    .attr('rx', 4)
    .attr('fill', '#06d6a0')
    .transition()
    .duration(600)
    .attr('width', (d) => xScale(d.cards));

  g.selectAll('text.week')
    .data(weeks)
    .join('text')
    .attr('class', 'week')
    .attr('x', -10)
    .attr('y', (d) => (yScale(`Неделя ${d.week}`) || 0) + yScale.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'end')
    .attr('font-size', '0.72rem')
    .attr('font-weight', '700')
    .attr('fill', 'var(--ink)')
    .text((d) => `Н${d.week}`);

  g.selectAll('text.focus')
    .data(weeks)
    .join('text')
    .attr('class', 'focus')
    .attr('x', innerW / 2)
    .attr('y', (d) => (yScale(`Неделя ${d.week}`) || 0) - 4)
    .attr('text-anchor', 'middle')
    .attr('font-size', '0.65rem')
    .attr('font-weight', '600')
    .attr('fill', 'var(--ink-secondary)')
    .text((d) => d.focus);

  g.selectAll('text.val')
    .data(weeks)
    .join('text')
    .attr('class', 'val')
    .attr('x', (d) => xScale(d.speak) + 6)
    .attr('y', (d) => (yScale(`Неделя ${d.week}`) || 0) + yScale.bandwidth() * 0.32)
    .attr('font-size', '0.6rem')
    .attr('font-weight', '600')
    .attr('fill', 'var(--accent)')
    .text((d) => `${d.speak} speaking`);

  g.selectAll('text.val2')
    .data(weeks)
    .join('text')
    .attr('class', 'val2')
    .attr('x', (d) => xScale(d.cards) + 6)
    .attr('y', (d) => (yScale(`Неделя ${d.week}`) || 0) + yScale.bandwidth() * 0.72)
    .attr('font-size', '0.6rem')
    .attr('font-weight', '600')
    .attr('fill', '#06d6a0')
    .text((d) => `${d.cards} cards · ${d.inputMin} мин input`);
}
