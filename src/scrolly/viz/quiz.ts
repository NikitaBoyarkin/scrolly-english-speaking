import * as d3 from 'd3';
import {
  quizStorageKey,
  loadQuizState,
  saveQuizState,
  clearQuizState,
  computeTotals,
  findLevel,
  findRecommendation,
  type QuizConfig,
} from './quiz-state';

/**
 * «Где ты сейчас» — интерактивная самопроверка (мотив Fluently «Know exactly
 * where you stand»). Мастер из 4 вопросов (по оси навыка) → результат: уровень,
 * профиль по осям и рекомендуемый рабочий сценарий. Результат персистится в
 * localStorage; «Пройти заново» сбрасывает его.
 */
export function render(mountId: string, props?: QuizConfig) {
  const mount = document.getElementById(mountId) as HTMLElement | null;
  if (!mount) return;

  const config = props || { questions: [], levels: [], recommendations: {} };
  const questions = config.questions || [];
  if (questions.length === 0) return;

  const key = quizStorageKey(mountId);
  const storage = window.localStorage;

  // Non-null capture so closures below keep a stable, non-null reference.
  const el = mount;

  el.replaceChildren();

  const answers = loadQuizState(key, questions.length, storage);
  const allAnswered = answers.every((a) => a !== null);

  if (allAnswered) {
    renderResult();
  } else {
    const start = answers.findIndex((a) => a === null);
    renderQuestion(start === -1 ? 0 : start);
  }

  function renderQuestion(i: number) {
    const q = questions[i];
    if (!q) return;
    el.replaceChildren();

    const root = d3div('quiz quiz-wizard');

    // Progress
    const progress = d3div('quiz-progress', root);
    progress.append('span').text(`Вопрос ${i + 1} из ${questions.length}`);
    const dots = progress.append('span').attr('class', 'quiz-dots');
    questions.forEach((_, di) => {
      const dot = dots.append('span').attr('class', 'quiz-dot');
      if (di === i) dot.classed('current', true);
      else if (answers[di] !== null) dot.classed('done', true);
    });

    // Axis tag + prompt
    root.append('div').attr('class', 'quiz-axis').text(q.label);
    root.append('h4').attr('class', 'quiz-prompt').text(q.prompt);

    // Options
    const opts = root.append('div').attr('class', 'quiz-options').attr('role', 'radiogroup');
    q.options.forEach((option, oi) => {
      const btn = opts
        .append('button')
        .attr('type', 'button')
        .attr('class', 'quiz-option')
        .attr('role', 'radio')
        .attr('aria-checked', 'false')
        .attr('data-q', i)
        .attr('data-o', oi)
        .text(option.label);
      if (answers[i] === oi) {
        btn.classed('selected', true).attr('aria-checked', 'true');
      }
      btn.on('click', () => {
        answers[i] = oi;
        saveQuizState(key, answers, storage);
        opts.selectAll('.quiz-option').classed('selected', false).attr('aria-checked', 'false');
        btn.classed('selected', true).attr('aria-checked', 'true');
        nextBtn.property('disabled', false);
      });
    });

    // Nav
    const nav = d3div('quiz-nav', root);
    const back = nav
      .append('button')
      .attr('type', 'button')
      .attr('class', 'quiz-back')
      .text('← Назад');
    back.on('click', () => {
      if (i > 0) renderQuestion(i - 1);
    });
    if (i === 0) back.property('disabled', true);

    const nextBtn = nav
      .append('button')
      .attr('type', 'button')
      .attr('class', 'quiz-next')
      .text(i === questions.length - 1 ? 'Показать результат' : 'Далее →');
    nextBtn.property('disabled', answers[i] === null);
    nextBtn.on('click', () => {
      if (answers[i] === null) return;
      if (i < questions.length - 1) {
        renderQuestion(i + 1);
      } else {
        saveQuizState(key, answers, storage);
        renderResult();
      }
    });
  }

  function renderResult() {
    // Defensive: a result is only meaningful when every question is answered.
    // Corrupt/partial state between load and render falls back to resuming the
    // quiz instead of showing a score from unanswered (scored-as-0) axes.
    const firstUnanswered = answers.findIndex((a) => a === null);
    if (firstUnanswered !== -1) {
      renderQuestion(firstUnanswered);
      return;
    }
    el.replaceChildren();
    const { scores, total } = computeTotals(answers, questions);
    const level = findLevel(total, config.levels) || { label: '', hint: '' };
    const { axisLabel, recommendation } = findRecommendation(
      scores,
      questions,
      config.recommendations,
    );

    const root = d3div('quiz quiz-result').attr('aria-live', 'polite');

    const badge = root.append('div').attr('class', 'quiz-level-badge');
    badge
      .append('span')
      .attr('class', 'quiz-level')
      .text(level.label || '—');
    if (level.hint) {
      root.append('p').attr('class', 'quiz-level-hint').text(level.hint);
    }

    // Axis profile bars (score / max).
    const bars = root.append('div').attr('class', 'quiz-bars');
    questions.forEach((q, i) => {
      const max = Math.max(...q.options.map((o) => o.score));
      const val = scores[i];
      const row = bars.append('div').attr('class', 'quiz-bar-row');
      row.append('span').attr('class', 'quiz-bar-label').text(q.label);
      const track = row.append('div').attr('class', 'quiz-bar-track');
      const fill = track.append('div').attr('class', 'quiz-bar-fill');
      const pct = max > 0 ? (val / max) * 100 : 0;
      fill.style('width', `${pct}%`);
      row.append('span').attr('class', 'quiz-bar-value').text(`${val}/${max}`);
    });

    // Recommendation.
    if (recommendation.scenario) {
      const reco = root.append('div').attr('class', 'quiz-reco');
      reco
        .append('span')
        .attr('class', 'quiz-reco-label')
        .text(`Слабейшая ось: ${axisLabel || ''} — начать с`);
      reco.append('strong').attr('class', 'quiz-reco-scenario').text(recommendation.scenario);
      if (recommendation.phrase) {
        reco.append('div').attr('class', 'quiz-reco-phrase').text(`«${recommendation.phrase}»`);
      }
    }

    const restart = root
      .append('button')
      .attr('type', 'button')
      .attr('class', 'quiz-restart')
      .text('Пройти заново');
    restart.on('click', () => {
      clearQuizState(key, storage);
      answers.forEach((_, i) => (answers[i] = null));
      renderQuestion(0);
    });
  }

  /** Helper: append a styled div (or return a d3 selection root). */
  function d3div(
    className: string,
    parent?: d3.Selection<HTMLDivElement, unknown, null, undefined>,
  ) {
    if (parent) {
      return parent.append('div').attr('class', className);
    }
    return d3.select(el).append('div').attr('class', className);
  }
}
