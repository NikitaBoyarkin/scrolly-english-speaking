import * as d3 from 'd3';
import { prepareSvg, estimateTextWidth } from './shared';
import { resourceTypeColors } from '../data/english-speaking';

interface Resource {
  name: string;
  type: string;
  level: number;
  recommended?: boolean;
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

  // Tooltip group — appended to the root svg so it draws above the points.
  const tooltip = svg
    .append('g')
    .attr('class', 'tooltip')
    .attr('opacity', 0)
    .style('pointer-events', 'none');
  const tipRect = tooltip
    .append('rect')
    .attr('rx', 6)
    .attr('fill', 'var(--paper)')
    .attr('stroke', 'var(--border)')
    .attr('stroke-width', 1);
  const tipName = tooltip
    .append('text')
    .attr('font-size', '0.72rem')
    .attr('font-weight', '700')
    .attr('fill', 'var(--ink)');
  const tipLine = tooltip
    .append('text')
    .attr('font-size', '0.66rem')
    .attr('fill', 'var(--ink-secondary)');

  function showTip(d: Resource, px: number, py: number) {
    const detail = `${d.type} · ${levelLabels[d.level] || d.level}`;
    tipName.text(d.recommended ? `★ ${d.name}` : d.name);
    tipLine.text(detail);
    const w = Math.max(estimateTextWidth(d.name, 11.5), estimateTextWidth(detail, 10.5)) + 20;
    const h = 44;
    let tx = px + 14;
    let ty = py - h - 10;
    if (tx + w > width) tx = px - w - 14;
    if (ty < 0) ty = py + 14;
    tipRect.attr('x', tx).attr('y', ty).attr('width', w).attr('height', h);
    tipName.attr('x', tx + 10).attr('y', ty + 18);
    tipLine.attr('x', tx + 10).attr('y', ty + 34);
    tooltip.attr('opacity', 1);
  }
  function hideTip() {
    tooltip.attr('opacity', 0);
  }

  g.selectAll('circle')
    .data(resources)
    .join('circle')
    .attr('cx', (d) => xScale(d.level))
    .attr('cy', (d) => (yScale(d.name) || 0) + yScale.bandwidth() / 2)
    .attr('r', 0)
    .attr('fill', (d) => resourceTypeColors[d.type] || '#9ca3af')
    .attr('stroke', 'var(--paper)')
    .attr('stroke-width', 2)
    .attr('tabindex', 0)
    .attr('role', 'img')
    .attr('aria-label', (d) => `${d.name} — ${d.type}, уровень ${levelLabels[d.level] || d.level}`)
    .style('cursor', 'pointer')
    .on('mouseover', function (event, d) {
      d3.select(this).attr('stroke', 'var(--ink)').attr('stroke-width', 3);
      showTip(
        d,
        xScale(d.level) + margin.left,
        (yScale(d.name) || 0) + margin.top + yScale.bandwidth() / 2,
      );
    })
    .on('mouseout', function () {
      d3.select(this).attr('stroke', 'var(--paper)').attr('stroke-width', 2);
      hideTip();
    })
    .on('focus', function (event, d) {
      d3.select(this).attr('stroke', 'var(--ink)').attr('stroke-width', 3);
      showTip(
        d,
        xScale(d.level) + margin.left,
        (yScale(d.name) || 0) + margin.top + yScale.bandwidth() / 2,
      );
    })
    .on('blur', function () {
      d3.select(this).attr('stroke', 'var(--paper)').attr('stroke-width', 2);
      hideTip();
    })
    .transition()
    .duration(500)
    .attr('r', 7);

  // Recommended highlight: dashed ring + ★ badge.
  resources.forEach((d) => {
    if (!d.recommended) return;
    const px = xScale(d.level);
    const py = (yScale(d.name) || 0) + yScale.bandwidth() / 2;
    svg
      .append('circle')
      .attr('cx', px + margin.left)
      .attr('cy', py + margin.top)
      .attr('r', 12)
      .attr('fill', 'none')
      .attr('stroke', 'var(--accent)')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '3 2')
      .style('opacity', 0)
      .transition()
      .duration(400)
      .style('opacity', 1);
    svg
      .append('text')
      .attr('x', px + margin.left + 12)
      .attr('y', py + margin.top - 8)
      .attr('font-size', '0.6rem')
      .attr('font-weight', '800')
      .attr('fill', 'var(--accent)')
      .style('opacity', 0)
      .text('★ Старт')
      .transition()
      .duration(400)
      .style('opacity', 1);
  });

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
