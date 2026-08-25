import { prepareSvg, wrapText } from './shared';
import { outcomeSkillColors, outcomeSkillLabels } from '../data/english-speaking';
import type { OutcomesProps, OutcomeScenario } from '../props.schema';

export type { OutcomeScenario };

const SKILL_ORDER = ['pronunciation', 'fluency', 'vocabulary', 'grammar'] as const;

/**
 * «Built for results»-грид: рабочие сценарии как карточки «до → после» с
 * ключевой фразой. Каждый сценарий тренирует свою композицию из четырёх
 * измерений (pronunciation / fluency / vocabulary / grammar) — точки снизу
 * показывают, какие из них задействованы.
 */
export function render(mountId: string, props: OutcomesProps) {
  const prepared = prepareSvg(mountId, {
    ariaLabel:
      'Рабочие сценарии: что меняется после 4 недель. Для каждого — ситуация, переход «до → после» и ключевая фраза.',
  });
  if (!prepared) return;
  const { svg, width, height } = prepared;

  const scenarios = props?.scenarios || [];
  if (scenarios.length === 0) return;

  const cols = 2;
  const gap = 8;
  const rows = Math.ceil(scenarios.length / cols);
  const cardW = (width - gap) / 2;
  const cardH = Math.min(118, (height - gap * (rows - 1)) / rows);

  const pad = 8;
  const titleSize = 11; // 0.7rem
  const flipSize = 9; // 0.58rem
  const phraseSize = 9;

  scenarios.forEach((sc, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col * (cardW + gap);
    const y = row * (cardH + gap);

    const card = svg
      .append('g')
      .attr('class', 'outcome-card')
      .attr('tabindex', 0)
      .attr('role', 'img')
      .attr(
        'aria-label',
        `${sc.title}: до — ${sc.before}, после — ${sc.after}. Фраза: ${sc.phrase}`,
      )
      .style('cursor', 'default');

    card
      .append('rect')
      .attr('x', x)
      .attr('y', y)
      .attr('width', cardW)
      .attr('height', cardH)
      .attr('rx', 10)
      .attr('fill', 'var(--paper-dark)')
      .attr('stroke', 'var(--border)')
      .attr('stroke-width', 1);

    const innerW = cardW - pad * 2;
    const dotAreaW = 26;

    // Title (single line, leaves room for the skill dots on the right).
    const titleW = innerW - dotAreaW;
    const title = card
      .append('text')
      .attr('x', x + pad)
      .attr('y', y + pad + titleSize)
      .attr('font-size', `${titleSize}px`)
      .attr('font-weight', '700')
      .attr('fill', 'var(--ink)');
    const titleText =
      sc.title.length * titleSize * 0.6 > titleW ? sc.title.slice(0, 24) + '…' : sc.title;
    title.text(titleText);

    // Before → after (wrapped, max 2 lines).
    const flipText = sc.before.length > 0 ? `до: ${sc.before} → после: ${sc.after}` : sc.after;
    const flipLines = wrapText(flipText, innerW, flipSize).slice(0, 2);
    card
      .append('text')
      .attr('x', x + pad)
      .attr('y', y + pad + titleSize + 12)
      .attr('font-size', `${flipSize}px`)
      .attr('fill', 'var(--ink-secondary)')
      .selectAll('tspan')
      .data(flipLines)
      .join('tspan')
      .attr('x', x + pad)
      .attr('dy', (_d, li) => (li === 0 ? '0em' : '1.25em'))
      .text((d) => d);

    // Key phrase pill: wraps to fit the card width; bottom-aligned so the card
    // height stays fixed regardless of line count.
    const phrase = `“${sc.phrase}”`;
    const phraseInner = innerW - 8;
    const phraseLines = wrapText(phrase, phraseInner, phraseSize).slice(0, 3);
    const pillH = phraseLines.length * phraseSize * 1.25 + 8;
    const pillY = y + cardH - pad - pillH;
    const pillW = innerW;
    card
      .append('rect')
      .attr('x', x + pad)
      .attr('y', pillY)
      .attr('width', pillW)
      .attr('height', pillH)
      .attr('rx', 8)
      .attr('fill', 'var(--accent-soft)')
      .attr('stroke', 'var(--accent)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3 2');
    card
      .append('text')
      .attr('x', x + pad + 4)
      .attr('y', pillY + pillH / 2)
      .attr('dy', '0.35em')
      .attr('font-size', `${phraseSize}px`)
      .attr('font-weight', '600')
      .attr('fill', 'var(--accent)')
      .selectAll('tspan')
      .data(phraseLines)
      .join('tspan')
      .attr('x', x + pad + 4)
      .attr('dy', (_d, li) => (li === 0 ? '0em' : '1.25em'))
      .text((d) => d);

    // Skill dots at top-right of the title row.
    const dotR = 2.6;
    const dotGap = 7;
    const startX = x + cardW - pad - dotGap * (SKILL_ORDER.length - 1) - dotR;
    const dotY = y + pad + titleSize / 2;
    SKILL_ORDER.forEach((key, si) => {
      const active = sc.skills[key];
      card
        .append('circle')
        .attr('cx', startX + si * dotGap)
        .attr('cy', dotY)
        .attr('r', dotR)
        .attr('fill', active ? outcomeSkillColors[key] : 'var(--border)')
        .attr('opacity', active ? 1 : 0.6);
      if (active) {
        card.append('title').text(`${sc.title}: ${outcomeSkillLabels[key]}`);
      }
    });
  });
}
