import * as d3 from 'd3';

interface ChecklistItem {
  label: string;
  done: boolean;
}

export function render(mountId: string, props: { items?: ChecklistItem[] }) {
  const node = document.getElementById(mountId);
  if (!node) return;

  const svg = d3.select(node);
  svg.selectAll('*').remove();

  const rect = node.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  if (width === 0 || height === 0) return;

  svg.attr('viewBox', `0 0 ${width} ${height}`).attr('width', width).attr('height', height);

  const items = props?.items || [];
  if (items.length === 0) return;

  const margin = { top: 24, right: 16, bottom: 24, left: 24 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

  const rowH = innerH / items.length;

  items.forEach((item, i) => {
    const y = i * rowH + rowH * 0.15;
    const h = rowH * 0.7;

    g.append('rect')
      .attr('x', 0)
      .attr('y', y + (h - 18) / 2)
      .attr('width', 18)
      .attr('height', 18)
      .attr('rx', 4)
      .attr('fill', item.done ? '#06d6a0' : 'var(--paper)')
      .attr('stroke', item.done ? '#06d6a0' : 'var(--border)')
      .attr('stroke-width', 2);

    if (item.done) {
      g.append('path')
        .attr('d', `M 4 ${y + (h - 18) / 2 + 9} L 8 ${y + (h - 18) / 2 + 13} L 14 ${y + (h - 18) / 2 + 5}`)
        .attr('fill', 'none')
        .attr('stroke', 'var(--paper)')
        .attr('stroke-width', 2)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round');
    }

    g.append('text')
      .attr('x', 28)
      .attr('y', y + h / 2)
      .attr('dy', '0.35em')
      .attr('font-size', '0.74rem')
      .attr('font-weight', item.done ? '600' : '400')
      .attr('fill', item.done ? 'var(--ink-secondary)' : 'var(--ink)')
      .attr('text-decoration', item.done ? 'line-through' : 'none')
      .text(item.label);
  });
}
