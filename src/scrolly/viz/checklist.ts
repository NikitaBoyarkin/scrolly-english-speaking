import * as d3 from 'd3';
import { prepareSvg, wrapText } from './shared';
import { checklistStorageKey, loadChecklistState, saveChecklistState } from './checklist-state';
import type { ChecklistProps } from '../props.schema';

interface RowRefs {
  row: SVGGElement;
  box: SVGRectElement;
  check: SVGPathElement | null;
  text: SVGTextElement;
}

export function render(mountId: string, props: ChecklistProps) {
  const prepared = prepareSvg(mountId, {
    ariaLabel: 'Чек-лист: нажмите, чтобы отметить шаг выполненным',
  });
  if (!prepared) return;
  const { svg, width, height } = prepared;

  const items = props?.items || [];
  if (items.length === 0) return;

  const key = checklistStorageKey(mountId);
  const state = loadChecklistState(key, items, localStorage);

  const margin = { top: 24, bottom: 24, left: 24 };
  const innerH = height - margin.top - margin.bottom;

  const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

  const rowH = innerH / items.length;
  const refs: RowRefs[] = [];

  items.forEach((item, i) => {
    const y = i * rowH + rowH * 0.15;
    const h = rowH * 0.7;
    const boxY = y + (h - 18) / 2;
    const done = state[i];

    const row = g
      .append('g')
      .attr('class', 'checklist-row')
      .attr('data-index', i)
      .style('cursor', 'pointer')
      .attr('role', 'checkbox')
      .attr('aria-checked', done ? 'true' : 'false')
      .attr('aria-label', item.label)
      .attr('tabindex', 0);

    const box = row
      .append('rect')
      .attr('x', 0)
      .attr('y', boxY)
      .attr('width', 18)
      .attr('height', 18)
      .attr('rx', 4)
      .attr('fill', done ? 'var(--secondary)' : 'var(--paper)')
      .attr('stroke', done ? 'var(--secondary)' : 'var(--border)')
      .attr('stroke-width', 2)
      .node() as SVGRectElement;

    let check: SVGPathElement | null = null;
    if (done) {
      check = row
        .append('path')
        .attr('d', `M 4 ${boxY + 9} L 8 ${boxY + 13} L 14 ${boxY + 5}`)
        .attr('fill', 'none')
        .attr('stroke', 'var(--paper)')
        .attr('stroke-width', 2)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .node() as SVGPathElement;
    }

    const text = row
      .append('text')
      .attr('x', 28)
      .attr('y', y + h / 2)
      .attr('dy', '0.35em')
      .attr('font-size', '0.74rem')
      .attr('font-weight', done ? '600' : '400')
      .attr('fill', done ? 'var(--ink-secondary)' : 'var(--ink)')
      .attr('text-decoration', done ? 'line-through' : 'none')
      .node() as SVGTextElement;

    // Long labels wrap to a second tspan instead of clipping on narrow panels.
    const labelFontPx = 11.8; // 0.74rem
    const availableW = width - margin.left - 28 - 8;
    const lines = wrapText(item.label, availableW, labelFontPx);
    lines.forEach((line, li) => {
      d3.select(text)
        .append('tspan')
        .attr('x', 28)
        .attr('dy', li === 0 ? '0em' : '1.2em')
        .text(line);
    });

    refs.push({ row: row.node() as SVGGElement, box, check, text });

    const toggle = () => {
      state[i] = !state[i];
      saveChecklistState(key, state, localStorage);
      applyRowState(refs[i], state[i]);
    };

    row.on('click', (event: MouseEvent) => {
      event.preventDefault();
      toggle();
    });
    row.on('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggle();
      }
    });
  });
}

/** Update one row in place so the SVG is not rebuilt and keyboard focus is
 * preserved across toggles (a full re-render would destroy the focused row). */
function applyRowState(ref: RowRefs, done: boolean): void {
  d3.select(ref.row).attr('aria-checked', String(done));

  d3.select(ref.box)
    .attr('fill', done ? 'var(--secondary)' : 'var(--paper)')
    .attr('stroke', done ? 'var(--secondary)' : 'var(--border)');

  if (done && !ref.check) {
    const boxY = Number(ref.box.getAttribute('y'));
    ref.check = d3
      .select(ref.row)
      .append('path')
      .attr('d', `M 4 ${boxY + 9} L 8 ${boxY + 13} L 14 ${boxY + 5}`)
      .attr('fill', 'none')
      .attr('stroke', 'var(--paper)')
      .attr('stroke-width', 2)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .node() as SVGPathElement;
  } else if (!done && ref.check) {
    d3.select(ref.check).remove();
    ref.check = null;
  }

  d3.select(ref.text)
    .attr('font-weight', done ? '600' : '400')
    .attr('fill', done ? 'var(--ink-secondary)' : 'var(--ink)')
    .attr('text-decoration', done ? 'line-through' : 'none');
}
