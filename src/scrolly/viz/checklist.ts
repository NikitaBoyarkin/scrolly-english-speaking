import * as d3 from 'd3';
import {
  checklistStorageKey,
  loadChecklistState,
  saveChecklistState,
  type ChecklistItem,
} from './checklist-state';

export function render(mountId: string, props: { items?: ChecklistItem[] }) {
  const node = document.getElementById(mountId);
  if (!node) return;

  const svg = d3.select(node);
  svg.selectAll('*').remove();
  // Interactive checklist: override the layout's role="img" + aria-labelledby
  // with a descriptive aria-label (the per-row instruction matters more than the title).
  svg
    .attr('role', 'group')
    .attr('aria-labelledby', null)
    .attr('aria-label', 'Чек-лист: нажмите, чтобы отметить шаг выполненным');

  const rect = node.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  if (width === 0 || height === 0) return;

  svg.attr('viewBox', `0 0 ${width} ${height}`).attr('width', width).attr('height', height);

  const items = props?.items || [];
  if (items.length === 0) return;

  const key = checklistStorageKey(mountId);
  const state = loadChecklistState(key, items, localStorage);

  const margin = { top: 24, right: 16, bottom: 24, left: 24 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

  const rowH = innerH / items.length;

  function rerender() {
    render(mountId, props);
  }

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

    row
      .append('rect')
      .attr('x', 0)
      .attr('y', boxY)
      .attr('width', 18)
      .attr('height', 18)
      .attr('rx', 4)
      .attr('fill', done ? 'var(--secondary)' : 'var(--paper)')
      .attr('stroke', done ? 'var(--secondary)' : 'var(--border)')
      .attr('stroke-width', 2);

    if (done) {
      row
        .append('path')
        .attr('d', `M 4 ${boxY + 9} L 8 ${boxY + 13} L 14 ${boxY + 5}`)
        .attr('fill', 'none')
        .attr('stroke', 'var(--paper)')
        .attr('stroke-width', 2)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round');
    }

    row
      .append('text')
      .attr('x', 28)
      .attr('y', y + h / 2)
      .attr('dy', '0.35em')
      .attr('font-size', '0.74rem')
      .attr('font-weight', done ? '600' : '400')
      .attr('fill', done ? 'var(--ink-secondary)' : 'var(--ink)')
      .attr('text-decoration', done ? 'line-through' : 'none')
      .text(item.label);

    const toggle = () => {
      state[i] = !state[i];
      saveChecklistState(key, state, localStorage);
      rerender();
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

  // suppress unused var lint without runtime cost
  void innerW;
}
