import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initScrollyRuntime } from '../src/scrolly/scrolly-runtime';
import { config } from '../src/scrolly/data/english-speaking';

/** happy-dom reports a zero-size rect by default; every renderer early-returns
 * on that. Stub a realistic viewport so the chart actually renders. */
function fakeRect(): DOMRect {
  return {
    x: 0,
    y: 0,
    top: 0,
    right: 800,
    bottom: 600,
    left: 0,
    width: 800,
    height: 600,
    toJSON() {},
  } as DOMRect;
}

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  callback: IntersectionObserverCallback;
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    FakeIntersectionObserver.instances.push(this);
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  /** Test helper: fire an intersecting entry for a section id. */
  intersect(id: string) {
    const target = document.querySelector(`.scroll-section[data-section-id="${id}"]`);
    if (!target) throw new Error(`no section element for "${id}"`);
    const entry = { isIntersecting: true, target } as IntersectionObserverEntry;
    this.callback([entry], this as unknown as IntersectionObserver);
  }
}

class FakeResizeObserver {
  constructor(_callback: ResizeObserverCallback) {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

const runtimeConfig = config.sections.map((s) => ({
  id: s.id,
  vizKey: s.viz?.key,
  vizProps: s.viz?.props,
}));

function setupDom() {
  const sectionsHtml = config.sections
    .map(
      (s) =>
        `<section class="scroll-section" data-section-id="${s.id}" id="section-${s.id}"></section>`,
    )
    .join('');
  const panelsHtml = config.sections
    .map(
      (s) =>
        `<div class="viz-panel" data-panel-for="${s.id}"><div class="viz-stage"><svg id="chart-${s.id}" data-viz-mount></svg></div></div>`,
    )
    .join('');
  const dotsHtml = config.sections
    .map((s) => `<button class="nav-dot" data-target="${s.id}"></button>`)
    .join('');
  document.body.innerHTML = `
    <div class="progress-bar"></div>
    <div id="scrolly-section-config">${JSON.stringify(runtimeConfig)}</div>
    ${sectionsHtml}
    ${panelsHtml}
    <nav class="nav-dots">${dotsHtml}</nav>
    <div class="viz-sticky"></div>
    <button data-reset-checklist="start">Сбросить</button>
  `;
  document.querySelectorAll('[data-viz-mount]').forEach((el) => {
    (el as HTMLElement).getBoundingClientRect = fakeRect;
  });
}

const tick = () => new Promise((r) => setTimeout(r, 30));

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    setTimeout(() => cb(0), 0);
    return 0;
  });
  vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(() => {});
  FakeIntersectionObserver.instances = [];
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('scrolly-runtime wiring', () => {
  it('initializes, activates the first section, mounts its viz and syncs the hash', async () => {
    setupDom();
    initScrollyRuntime();
    await tick();

    expect(
      document.querySelector('.viz-panel[data-panel-for="intro"]')?.classList.contains('active'),
    ).toBe(true);
    expect(document.getElementById('chart-intro')?.getAttribute('viewBox')).toBeTruthy();
    expect(window.location.hash).toBe('#section-intro');
    expect(document.querySelector('.progress-bar')).toBeTruthy();
  });

  it('nav-dot click pushes the hash and scrolls to the section', () => {
    setupDom();
    initScrollyRuntime();
    const scrollSpy = vi.mocked(Element.prototype.scrollIntoView);

    const dot = document.querySelector('.nav-dot[data-target="plan"]') as HTMLElement;
    dot.click();

    expect(scrollSpy).toHaveBeenCalled();
    expect(window.location.hash).toBe('#section-plan');
  });

  it('intersecting a section switches the active panel and mounts its viz', async () => {
    setupDom();
    initScrollyRuntime();
    await tick();

    const observer = FakeIntersectionObserver.instances[0];
    observer.intersect('plan');
    await tick();

    expect(
      document.querySelector('.viz-panel[data-panel-for="plan"]')?.classList.contains('active'),
    ).toBe(true);
    expect(document.getElementById('chart-plan')?.getAttribute('viewBox')).toBeTruthy();
    expect(window.location.hash).toBe('#section-plan');
  });

  it('reset button clears persisted checklist state', async () => {
    setupDom();
    initScrollyRuntime();
    await tick();

    localStorage.setItem(
      'scrolly-checklist:chart-start',
      JSON.stringify([true, false, false, false, false, false, false]),
    );
    const btn = document.querySelector('[data-reset-checklist="start"]') as HTMLElement;
    btn.click();
    await tick();

    expect(localStorage.getItem('scrolly-checklist:chart-start')).toBeNull();
  });
});
