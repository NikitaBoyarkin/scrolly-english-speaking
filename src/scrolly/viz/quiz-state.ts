/**
 * Pure, unit-testable logic + persistence for the interactive self-assessment
 * viz («Где ты сейчас»). Extracted from `quiz.ts` so scoring, level lookup and
 * storage are testable with an injectable storage object (no DOM coupling).
 *
 * The quiz config shapes live in `props.schema.ts` (single source of truth for
 * the zod contract and the renderer's prop type); re-exported here so the pure
 * functions and their tests keep importing from this module.
 */
import type {
  QuizOption,
  QuizQuestion,
  QuizLevel,
  QuizRecommendation,
  QuizProps,
} from '../props.schema';

export type { QuizOption, QuizQuestion, QuizLevel, QuizRecommendation };
export type QuizConfig = QuizProps;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
}

export const QUIZ_STORAGE_PREFIX = 'scrolly-quiz:';

export function quizStorageKey(mountId: string): string {
  return `${QUIZ_STORAGE_PREFIX}${mountId}`;
}

/** Read persisted answers (chosen option index per question); null where a
 * question is unanswered. Falls back to all-null on empty/corrupt/mismatched
 * storage. */
export function loadQuizState(
  key: string,
  questionCount: number,
  storage: StorageLike,
): (number | null)[] {
  try {
    const raw = storage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === questionCount) {
        return parsed.map((v) => (Number.isInteger(v) ? (v as number) : null));
      }
    }
  } catch {
    /* ignore corrupt storage */
  }
  return Array(questionCount).fill(null) as (number | null)[];
}

export function saveQuizState(key: string, answers: (number | null)[], storage: StorageLike): void {
  try {
    storage.setItem(key, JSON.stringify(answers));
  } catch {
    /* storage may be unavailable (private mode) — keep session-only state */
  }
}

export function clearQuizState(key: string, storage: StorageLike): void {
  try {
    storage.removeItem?.(key);
  } catch {
    /* ignore */
  }
}

/** Per-question score (0 when unanswered) and the sum across all questions. */
export function computeTotals(
  answers: (number | null)[],
  questions: QuizQuestion[],
): { scores: number[]; total: number } {
  const scores = questions.map((q, i) => {
    const idx = answers[i];
    if (idx === null || idx === undefined) return 0;
    return q.options[idx]?.score ?? 0;
  });
  return { scores, total: scores.reduce((a, b) => a + b, 0) };
}

/** The level bucket whose [min, max] range contains `total`. */
export function findLevel(total: number, levels: QuizLevel[]): QuizLevel | undefined {
  return levels.find((l) => total >= l.min && total <= l.max);
}

/** The weakest axis (lowest score) → the scenario that trains it first. With no
 * scores (empty input) there is no weakest axis — return an empty recommendation
 * instead of arbitrarily picking the first question. */
export function findRecommendation(
  scores: number[],
  questions: QuizQuestion[],
  recommendations: Record<string, QuizRecommendation>,
): { axisId: string; axisLabel: string; recommendation: QuizRecommendation } {
  if (scores.length === 0) {
    return { axisId: '', axisLabel: '', recommendation: { scenario: '', phrase: '' } };
  }
  const minScore = Math.min(...scores);
  const idx = scores.findIndex((s) => s === minScore);
  const axisId = questions[idx]?.id || '';
  const axisLabel = questions[idx]?.label || '';
  const rec = recommendations[axisId] ||
    Object.values(recommendations)[0] || { scenario: '', phrase: '' };
  return { axisId, axisLabel, recommendation: rec };
}
