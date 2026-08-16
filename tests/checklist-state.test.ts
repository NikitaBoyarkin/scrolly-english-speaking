import { describe, it, expect } from 'vitest';
import {
  loadChecklistState,
  saveChecklistState,
  checklistStorageKey,
  CHECKLIST_STORAGE_PREFIX,
  type StorageLike,
} from '../src/scrolly/viz/checklist-state';

function memStorage(): StorageLike {
  const m = new Map<string, string>();
  return {
    getItem: (k) => (m.has(k) ? m.get(k)! : null),
    setItem: (k, v) => void m.set(k, v),
  };
}

const items = (dones: boolean[]) => dones.map((d) => ({ label: 'x', done: d }));

describe('checklistStorageKey', () => {
  it('prefixes the mount id', () => {
    expect(checklistStorageKey('abc')).toBe(`${CHECKLIST_STORAGE_PREFIX}abc`);
  });
});

describe('loadChecklistState', () => {
  it('falls back to static props when storage is empty', () => {
    const s = memStorage();
    expect(loadChecklistState(checklistStorageKey('x'), items([true, false]), s)).toEqual([
      true,
      false,
    ]);
  });

  it('returns persisted state on round-trip', () => {
    const s = memStorage();
    saveChecklistState(checklistStorageKey('x'), [false, true, false], s);
    expect(loadChecklistState(checklistStorageKey('x'), items([false, false, false]), s)).toEqual([
      false,
      true,
      false,
    ]);
  });

  it('falls back when stored length mismatches props', () => {
    const s = memStorage();
    saveChecklistState(checklistStorageKey('x'), [true, true], s); // length 2
    expect(loadChecklistState(checklistStorageKey('x'), items([false]), s)).toEqual([false]); // length 1 -> fallback
  });

  it('ignores corrupt storage', () => {
    const s = memStorage();
    s.setItem(checklistStorageKey('x'), 'not-json');
    expect(loadChecklistState(checklistStorageKey('x'), items([false]), s)).toEqual([false]);
  });

  it('coerces truthy non-boolean entries to booleans', () => {
    const s = memStorage();
    s.setItem(checklistStorageKey('x'), JSON.stringify([1, 0, 'yes']));
    expect(loadChecklistState(checklistStorageKey('x'), items([false, false, false]), s)).toEqual([
      true,
      false,
      true,
    ]);
  });
});

describe('saveChecklistState', () => {
  it('writes JSON array', () => {
    const s = memStorage();
    saveChecklistState(checklistStorageKey('x'), [true, false], s);
    expect(s.getItem(checklistStorageKey('x'))).toBe('[true,false]');
  });

  it('does not throw when storage is unavailable', () => {
    const failing: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new Error('quota');
      },
    };
    expect(() => saveChecklistState(checklistStorageKey('x'), [true], failing)).not.toThrow();
  });
});
