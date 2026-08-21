import { describe, it, expect } from 'vitest';
import {
  quizStorageKey,
  loadQuizState,
  saveQuizState,
  clearQuizState,
  computeTotals,
  findLevel,
  findRecommendation,
  QUIZ_STORAGE_PREFIX,
  type StorageLike,
  type QuizQuestion,
  type QuizLevel,
  type QuizRecommendation,
} from '../src/scrolly/viz/quiz-state';

function memStorage(): StorageLike {
  const m = new Map<string, string>();
  return {
    getItem: (k) => (m.has(k) ? m.get(k)! : null),
    setItem: (k, v) => void m.set(k, v),
    removeItem: (k) => void m.delete(k),
  };
}

const questions: QuizQuestion[] = [
  {
    id: 'fluency',
    label: 'Беглость',
    prompt: 'p',
    options: [
      { label: 'a', score: 0 },
      { label: 'b', score: 1 },
      { label: 'c', score: 2 },
      { label: 'd', score: 3 },
    ],
  },
  {
    id: 'vocabulary',
    label: 'Словарь',
    prompt: 'p',
    options: [
      { label: 'a', score: 0 },
      { label: 'b', score: 1 },
      { label: 'c', score: 2 },
      { label: 'd', score: 3 },
    ],
  },
  {
    id: 'grammar',
    label: 'Грамматика',
    prompt: 'p',
    options: [
      { label: 'a', score: 0 },
      { label: 'b', score: 1 },
      { label: 'c', score: 2 },
      { label: 'd', score: 3 },
    ],
  },
  {
    id: 'pronunciation',
    label: 'Произношение',
    prompt: 'p',
    options: [
      { label: 'a', score: 0 },
      { label: 'b', score: 1 },
      { label: 'c', score: 2 },
      { label: 'd', score: 3 },
    ],
  },
];

const levels: QuizLevel[] = [
  { min: 0, max: 3, label: 'A1', hint: '' },
  { min: 4, max: 6, label: 'A2', hint: '' },
  { min: 7, max: 9, label: 'B1', hint: '' },
  { min: 10, max: 12, label: 'B1+', hint: '' },
];

const recommendations: Record<string, QuizRecommendation> = {
  fluency: { scenario: 'Stand-up', phrase: 'ph' },
  vocabulary: { scenario: 'Метрики', phrase: 'ph' },
  grammar: { scenario: 'Дедлайн', phrase: 'ph' },
  pronunciation: { scenario: 'Small talk', phrase: 'ph' },
};

describe('quizStorageKey', () => {
  it('prefixes the mount id', () => {
    expect(quizStorageKey('abc')).toBe(`${QUIZ_STORAGE_PREFIX}abc`);
  });
});

describe('loadQuizState', () => {
  it('returns all-null when storage is empty', () => {
    expect(loadQuizState(quizStorageKey('x'), 4, memStorage())).toEqual([null, null, null, null]);
  });

  it('round-trips persisted answers', () => {
    const s = memStorage();
    saveQuizState(quizStorageKey('x'), [0, 3, 1, null], s);
    expect(loadQuizState(quizStorageKey('x'), 4, s)).toEqual([0, 3, 1, null]);
  });

  it('falls back to all-null on length mismatch', () => {
    const s = memStorage();
    saveQuizState(quizStorageKey('x'), [0, 1], s); // length 2
    expect(loadQuizState(quizStorageKey('x'), 4, s)).toEqual([null, null, null, null]);
  });

  it('ignores corrupt storage', () => {
    const s = memStorage();
    s.setItem(quizStorageKey('x'), 'not-json');
    expect(loadQuizState(quizStorageKey('x'), 4, s)).toEqual([null, null, null, null]);
  });

  it('nulls non-integer entries', () => {
    const s = memStorage();
    s.setItem(quizStorageKey('x'), JSON.stringify([0, 'yes', 2, 3]));
    expect(loadQuizState(quizStorageKey('x'), 4, s)).toEqual([0, null, 2, 3]);
  });
});

describe('clearQuizState', () => {
  it('removes the key', () => {
    const s = memStorage();
    saveQuizState(quizStorageKey('x'), [0, 1, 2, 3], s);
    clearQuizState(quizStorageKey('x'), s);
    expect(loadQuizState(quizStorageKey('x'), 4, s)).toEqual([null, null, null, null]);
  });
});

describe('computeTotals', () => {
  it('sums option scores and maps per-axis', () => {
    const { scores, total } = computeTotals([0, 1, 3, 2], questions);
    expect(scores).toEqual([0, 1, 3, 2]);
    expect(total).toBe(6);
  });

  it('treats unanswered as 0', () => {
    const { total } = computeTotals([null, 3, null, 1], questions);
    expect(total).toBe(4);
  });
});

describe('findLevel', () => {
  it('buckets total into the matching range', () => {
    expect(findLevel(2, levels)?.label).toBe('A1');
    expect(findLevel(6, levels)?.label).toBe('A2');
    expect(findLevel(8, levels)?.label).toBe('B1');
    expect(findLevel(12, levels)?.label).toBe('B1+');
  });
});

describe('findRecommendation', () => {
  it('recommends the scenario of the weakest axis', () => {
    const { axisLabel, recommendation } = findRecommendation(
      [1, 0, 2, 3],
      questions,
      recommendations,
    );
    expect(axisLabel).toBe('Словарь');
    expect(recommendation.scenario).toBe('Метрики');
  });

  it('breaks ties toward the first lowest axis', () => {
    const { axisLabel, recommendation } = findRecommendation(
      [0, 0, 1, 2],
      questions,
      recommendations,
    );
    expect(axisLabel).toBe('Беглость');
    expect(recommendation.scenario).toBe('Stand-up');
  });
});
