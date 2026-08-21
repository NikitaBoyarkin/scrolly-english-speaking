import * as d3 from 'd3';
import { prepareSvg, estimateTextWidth, clampX } from './shared';

export interface CefrLevel {
  level: string;
  weeks: number;
  marker: string;
  skill: string;
  color: string;
}

/**
 * CEFR-лестница: честные сроки перехода между уровнями при ритме
 * 30–45 мин/день (~5 ч/нед). Бары пропорциональны кумулятивным неделям —
 * визуально это «лестница» от A2 к C1, а не обещанные рекламой «32 недели до C1».
 */
export function render(mountId: string, props: { levels?: CefrLevel[]; dailyMinutes?: number }) {
  const prepared = prepareSvg(mountId, {
    ariaLabel:
      'Путь по уровням CEFR: A2 — вы здесь, B1 — цель плана, B2 и C1 — дальше. Сроки при 30–45 минутах в день.',
  });
  if (!prepared) return;
  const { svg, width, height } = prepared;

  const levels = props?.levels || [];
  if (levels.length === 0) return;

  const dailyMinutes = props?.dailyMinutes ?? 35;
  const margin = { top: 20, right: 8, bottom: 50, left: 84 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const bandH = innerH / levels.length;
  const maxWeeks = Math.max(...levels.map((d) => d.weeks), 1);
  const xScale = d3.scaleLinear().domain([0, maxWeeks]).range([0, innerW]);

  const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

  // Week gridlines at each hop (cumulative weeks), so the x-axis reads as a timeline.
  levels.forEach((d) => {
    const x = xScale(d.weeks);
    g.append('line')
      .attr('x1', x)
      .attr('x2', x)
      .attr('y1', 0)
      .attr('y2', innerH)
      .attr('stroke', 'var(--border)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2 4');
  });

  // Staircase path connecting the level tops.
  const points = levels.map((d, i) => ({
    x: xScale(d.weeks),
    y: i * bandH + bandH / 2,
  }));
  const line = d3
    .line<{ x: number; y: number }>()
    .x((d) => d.x)
    .y((d) => d.y)
    .curve(d3.curveStepAfter);
  g.append('path')
    .datum(points)
    .attr('fill', 'none')
    .attr('stroke', 'var(--ink-secondary)')
    .attr('stroke-width', 1.5)
    .attr('stroke-dasharray', '4 3')
    .attr('d', line);

  levels.forEach((d, i) => {
    const y = i * bandH + bandH / 2;
    const x = xScale(d.weeks);
    const barW = Math.max(14, x);
    const active = i < levels.length - 1;
    const fill = active ? d.color : 'var(--border)';

    // Level band bar (proportional width = journey length).
    g.append('rect')
      .attr('x', 0)
      .attr('y', y - 10)
      .attr('width', barW)
      .attr('height', 20)
      .attr('rx', 6)
      .attr('fill', fill)
      .attr('opacity', i === 1 ? 0.4 : active ? 0.16 : 0.5);

    // Level badge.
    g.append('circle')
      .attr('cx', 0)
      .attr('cy', y)
      .attr('r', 11)
      .attr('fill', active ? fill : 'var(--border)');
    g.append('text')
      .attr('x', 0)
      .attr('y', y)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('font-size', '0.62rem')
      .attr('font-weight', '800')
      .attr('fill', active ? 'var(--paper)' : 'var(--ink-secondary)')
      .text(d.level);

    // Marker label above the badge (text-anchor middle, centered on the badge).
    const markerSize = 9;
    g.append('text')
      .attr('x', 0)
      .attr('y', y - 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', `${markerSize}px`)
      .attr('font-weight', '700')
      .attr('fill', active ? d.color : 'var(--ink-secondary)')
      .text(d.marker);

    // Milestone skill text at the end of the bar — clear of the badge (≥16px)
    // and clamped so it never spills past the right edge of the chart.
    const skillW = estimateTextWidth(d.skill, 9.9);
    const skillX = Math.max(16, Math.min(x + 8, innerW - skillW));
    g.append('text')
      .attr('x', skillX)
      .attr('y', y)
      .attr('dy', '0.35em')
      .attr('font-size', '0.62rem')
      .attr('fill', 'var(--ink)')
      .text(d.skill);

    // Cumulative weeks label under the x-axis at this hop, clamped so the
    // leftmost/rightmost labels stay inside the chart.
    const weekLabel = `${d.weeks} нед`;
    const weekW = estimateTextWidth(weekLabel, 9.6);
    g.append('text')
      .attr('x', clampX(x, weekW, innerW))
      .attr('y', innerH + 16)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('font-size', '0.62rem')
      .attr('font-weight', '700')
      .attr('fill', 'var(--ink-secondary)')
      .text(weekLabel);
  });

  // Per-hop duration hint.
  const hopText = levels
    .slice(0, -1)
    .map((d, i) => {
      const next = levels[i + 1];
      return `${d.level}→${next.level} ≈ ${next.weeks - d.weeks} нед`;
    })
    .join(' · ');
  const hint = `~${dailyMinutes} мин/день · ${hopText}`;
  const hintW = estimateTextWidth(hint, 9.6);
  if (hintW <= innerW) {
    g.append('text')
      .attr('x', innerW / 2)
      .attr('y', innerH + 38)
      .attr('text-anchor', 'middle')
      .attr('font-size', '0.6rem')
      .attr('fill', 'var(--ink-secondary)')
      .text(hint);
  } else {
    // Split into two balanced lines if it would clip the panel width.
    const mid = Math.ceil(hopText.split('·').length / 2);
    const parts = hopText.split('·');
    const l1 = `~${dailyMinutes} мин/день · ${parts.slice(0, mid).join('·').trim()}`;
    const l2 = parts.slice(mid).join('·').trim();
    g.append('text')
      .attr('x', innerW / 2)
      .attr('y', innerH + 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', '0.6rem')
      .attr('fill', 'var(--ink-secondary)')
      .text(l1);
    g.append('text')
      .attr('x', innerW / 2)
      .attr('y', innerH + 42)
      .attr('text-anchor', 'middle')
      .attr('font-size', '0.6rem')
      .attr('fill', 'var(--ink-secondary)')
      .text(l2);
  }
}
