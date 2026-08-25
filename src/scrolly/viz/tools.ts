import * as d3 from 'd3';
import { prepareSvg, estimateTextWidth, clampX, animMs } from './shared';
import { toolTierColors } from '../data/english-speaking';

interface Tool {
  name: string;
  price: number;
  businessScore: number;
  tier: string;
  recommended?: boolean;
}

const TIER_LABELS: Record<string, string> = {
  free: 'Бесплатно',
  low: 'Дёшево',
  mid: 'Средний ценник',
  high: 'Premium / Enterprise',
};

export function render(mountId: string, props: { tools?: Tool[] }) {
  const prepared = prepareSvg(mountId, {
    ariaLabel:
      'Сравнение AI-инструментов: цена и бизнес-специфика. Наведите на точку или сфокусируйтесь клавиатурой для деталей.',
  });
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

  // Tooltip group — appended to the root svg so it draws above axes and points.
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

  function showTooltip(d: Tool, px: number, py: number) {
    const detail = `$${d.price}/мес · бизнес-специфика ${d.businessScore}/10`;
    tipName.text(d.name);
    tipLine.text(`${detail} · ${TIER_LABELS[d.tier] || d.tier}`);
    const w =
      Math.max(estimateTextWidth(d.name, 11.5), estimateTextWidth(tipLine.text() || '', 10.5)) + 20;
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
  function hideTooltip() {
    tooltip.attr('opacity', 0);
  }

  const highlight = (
    sel: d3.Selection<SVGCircleElement | d3.BaseType, Tool, null, undefined>,
    on: boolean,
  ) => {
    sel
      .attr('opacity', on ? 1 : 0.85)
      .attr('stroke', on ? 'var(--ink)' : 'var(--paper)')
      .attr('stroke-width', on ? 3 : 2);
  };

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
    .attr('tabindex', 0)
    .attr('role', 'img')
    .attr('aria-label', (d) => `${d.name}: $${d.price}/мес, бизнес-специфика ${d.businessScore}/10`)
    .style('cursor', 'pointer')
    .on('mouseover', function (_event, d) {
      highlight(d3.select(this), true);
      showTooltip(d, xScale(d.businessScore) + margin.left, yScale(d.price) + margin.top);
    })
    .on('mouseout', function () {
      highlight(d3.select(this), false);
      hideTooltip();
    })
    .on('focus', function (_event, d) {
      highlight(d3.select(this), true);
      showTooltip(d, xScale(d.businessScore) + margin.left, yScale(d.price) + margin.top);
    })
    .on('blur', function () {
      highlight(d3.select(this), false);
      hideTooltip();
    })
    .transition()
    .duration(animMs(500))
    .attr('r', (d) => (d.tier === 'free' ? 14 : 10));

  // Labels alternate above/below by index so close points (TalkMe/ELSA) don't
  // collide — then a small greedy pass nudges any still-overlapping labels apart.
  const labelH = 14; // ink box height for a 0.66rem label
  const cy = tools.map((d, i) => ({
    i,
    cx: xScale(d.businessScore),
    cy: i % 2 === 0 ? yScale(d.price) - 18 : yScale(d.price) + 26,
    w: estimateTextWidth(d.name, 10.5),
  }));
  // Resolve overlaps: push the lower label below the upper one, repeat to fix chains.
  for (let pass = 0; pass < cy.length; pass++) {
    let moved = false;
    for (let a = 0; a < cy.length; a++) {
      for (let b = a + 1; b < cy.length; b++) {
        const A = cy[a];
        const B = cy[b];
        const xOverlap = Math.abs(A.cx - B.cx) < (A.w + B.w) / 2 + 4;
        const yOverlap = Math.abs(A.cy - B.cy) < labelH;
        if (xOverlap && yOverlap) {
          if (A.cy <= B.cy) {
            B.cy = A.cy + labelH;
          } else {
            A.cy = B.cy + labelH;
          }
          moved = true;
        }
      }
    }
    if (!moved) break;
  }

  g.selectAll('text.label')
    .data(tools)
    .join('text')
    .attr('class', 'label')
    .attr('x', (_d, i) => clampX(cy[i].cx, cy[i].w, innerW))
    .attr('y', (_d, i) => cy[i].cy)
    .attr('text-anchor', 'middle')
    .attr('font-size', '0.66rem')
    .attr('font-weight', '600')
    .attr('fill', 'var(--ink)')
    .text((d) => d.name);

  // Recommended highlight: a dashed ring + a «★ Старт» badge on the entry point.
  tools.forEach((d) => {
    if (!d.recommended) return;
    const px = xScale(d.businessScore);
    const py = yScale(d.price);
    const ring = svg
      .append('circle')
      .attr('cx', px + margin.left)
      .attr('cy', py + margin.top)
      .attr('r', 20)
      .attr('fill', 'none')
      .attr('stroke', 'var(--accent)')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4 3')
      .style('opacity', 0);
    const badge = svg
      .append('text')
      .attr('x', px + margin.left + 20)
      .attr('y', py + margin.top - 6)
      .attr('font-size', '0.6rem')
      .attr('font-weight', '800')
      .attr('fill', 'var(--accent)')
      .style('opacity', 0)
      .text('★ Старт');
    ring.transition().duration(animMs(400)).style('opacity', 1);
    badge.transition().duration(animMs(400)).style('opacity', 1);
  });
}
