import { prepareSvg } from './shared';

interface WorkflowStep {
  id: string;
  label: string;
  minutes: string;
  color: string;
}

export function render(mountId: string, props: { steps?: WorkflowStep[] }) {
  const prepared = prepareSvg(mountId);
  if (!prepared) return;
  const { svg, width, height } = prepared;

  const steps = props?.steps || [];
  if (steps.length === 0) return;

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.32;
  const angleStep = (2 * Math.PI) / steps.length;

  const group = svg.append('g').attr('transform', `translate(${cx}, ${cy})`);

  group
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('y', -6)
    .attr('font-size', '0.9rem')
    .attr('font-weight', '700')
    .attr('fill', 'var(--ink)')
    .text('30–45 мин');
  group
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('y', 14)
    .attr('font-size', '0.7rem')
    .attr('fill', 'var(--ink-secondary)')
    .text('каждый день');

  for (let i = 0; i < steps.length; i++) {
    const a1 = i * angleStep - Math.PI / 2;
    const a2 = ((i + 1) % steps.length) * angleStep - Math.PI / 2;
    const x1 = Math.cos(a1) * radius;
    const y1 = Math.sin(a1) * radius;
    const x2 = Math.cos(a2) * radius;
    const y2 = Math.sin(a2) * radius;

    group
      .append('path')
      .attr('d', `M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`)
      .attr('fill', 'none')
      .attr('stroke', 'var(--border)')
      .attr('stroke-width', 3);

    const angle = Math.atan2(y2 - y1, x2 - x1);
    const ahLen = 8;
    group
      .append('path')
      .attr(
        'd',
        `M ${x2} ${y2} L ${x2 - ahLen * Math.cos(angle - Math.PI / 6)} ${y2 - ahLen * Math.sin(angle - Math.PI / 6)} L ${x2 - ahLen * Math.cos(angle + Math.PI / 6)} ${y2 - ahLen * Math.sin(angle + Math.PI / 6)} Z`,
      )
      .attr('fill', 'var(--border)');
  }

  steps.forEach((step, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    const g = group.append('g').attr('transform', `translate(${x}, ${y})`);

    g.append('circle').attr('r', 34).attr('fill', step.color).attr('opacity', 0.12);
    g.append('circle').attr('r', 18).attr('fill', step.color);

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', -28)
      .attr('font-size', '0.78rem')
      .attr('font-weight', '700')
      .attr('fill', 'var(--ink)')
      .text(step.label);

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', -44)
      .attr('font-size', '0.65rem')
      .attr('fill', 'var(--ink-secondary)')
      .text(step.minutes);
  });
}
