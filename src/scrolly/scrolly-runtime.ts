import { checklistStorageKey } from './viz/checklist-state';

type VizRenderer = (mountId: string, props: unknown) => void | Promise<void>;

interface SectionState {
  id: string;
  vizKey?: string;
  vizProps?: unknown;
  mounted: boolean;
}

// props arrive as `unknown` from the build-time JSON config (trusted data module).
// Cast to each renderer's exact prop type at this boundary.
const vizRenderers: Record<string, VizRenderer> = {
  workflow: (id, props) =>
    import('./viz/workflow').then((m) => m.render(id, props as Parameters<typeof m.render>[1])),
  tools: (id, props) =>
    import('./viz/tools').then((m) => m.render(id, props as Parameters<typeof m.render>[1])),
  bars: (id, props) =>
    import('./viz/bars').then((m) => m.render(id, props as Parameters<typeof m.render>[1])),
  resources: (id, props) =>
    import('./viz/resources').then((m) => m.render(id, props as Parameters<typeof m.render>[1])),
  metrics: (id, props) =>
    import('./viz/metrics').then((m) => m.render(id, props as Parameters<typeof m.render>[1])),
  calendar: (id, props) =>
    import('./viz/calendar').then((m) => m.render(id, props as Parameters<typeof m.render>[1])),
  checklist: (id, props) =>
    import('./viz/checklist').then((m) => m.render(id, props as Parameters<typeof m.render>[1])),
};

export function initScrollyRuntime() {
  const rawConfig = document.getElementById('scrolly-section-config')?.textContent || '';
  const sectionConfig: { id: string; vizKey?: string; vizProps?: unknown }[] = rawConfig
    ? ((parseJsonSafe(rawConfig) as
        { id: string; vizKey?: string; vizProps?: unknown }[] | null | undefined) ?? [])
    : [];

  const sectionConfigMap = new Map(sectionConfig.map((s) => [s.id, s]));

  const sections: SectionState[] = Array.from(document.querySelectorAll('.scroll-section')).map(
    (el) => {
      const id = el.getAttribute('data-section-id') || '';
      const cfg = sectionConfigMap.get(id);
      return {
        id,
        vizKey: cfg?.vizKey,
        vizProps: cfg?.vizProps,
        mounted: false,
      };
    },
  );

  const panels = new Map<string, HTMLElement>();
  document.querySelectorAll('.viz-panel').forEach((el) => {
    const key = el.getAttribute('data-panel-for');
    if (key) panels.set(key, el as HTMLElement);
  });

  const dots = Array.from(document.querySelectorAll('.nav-dot')) as HTMLElement[];
  let activeSectionId = '';

  function showPanelError(sectionId: string, message: string) {
    const panel = panels.get(sectionId);
    const mount = panel?.querySelector('[data-viz-mount]') as HTMLElement | null;
    if (mount) {
      mount.innerHTML = `<div style="padding:1rem;color:#b91c1c;font-size:0.8rem">${message}</div>`;
    }
  }

  function switchViz(sectionId: string, force = false) {
    activeSectionId = sectionId;
    panels.forEach((panel, key) => {
      panel.classList.toggle('active', key === sectionId);
    });

    // Keep the URL shareable without adding history entries on scroll.
    const hash = `#section-${sectionId}`;
    if (window.location.hash !== hash) {
      history.replaceState(null, '', hash);
    }

    const section = sections.find((s) => s.id === sectionId);
    if (section && section.vizKey) {
      if (!vizRenderers[section.vizKey]) {
        showPanelError(sectionId, `Unknown viz renderer: ${section.vizKey}`);
        return;
      }
      if (force || !section.mounted) {
        section.mounted = true;
        const panel = panels.get(sectionId);
        const mount = panel?.querySelector('[data-viz-mount]') as HTMLElement | null;
        if (mount) {
          const key = section.vizKey;
          const id = mount.id;
          Promise.resolve(vizRenderers[key]!(id, section.vizProps)).catch(() => {
            showPanelError(sectionId, 'Could not load visualization.');
          });
        }
      }
    }

    dots.forEach((dot) => {
      dot.classList.toggle('active', dot.getAttribute('data-target') === sectionId);
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = (entry.target as HTMLElement).getAttribute('data-section-id') || '';
        const sectionEl = document.getElementById(`section-${id}`);
        if (entry.isIntersecting) {
          sectionEl?.classList.add('active');
          switchViz(id);
        } else {
          sectionEl?.classList.remove('active');
        }
      });
    },
    { threshold: 0.45, rootMargin: '-10% 0px -25% 0px' },
  );

  sections.forEach((s) => {
    const el = document.querySelector(`.scroll-section[data-section-id="${s.id}"]`);
    if (el) observer.observe(el);
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const target = dot.getAttribute('data-target');
      if (target) {
        // pushState so Back returns to the previous section.
        history.pushState(null, '', `#section-${target}`);
        document
          .getElementById(`section-${target}`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Back/forward: scroll to the section named in the hash.
  window.addEventListener('hashchange', () => {
    const id = (window.location.hash || '').replace('#section-', '');
    if (id && document.getElementById(`section-${id}`)) {
      document
        .getElementById(`section-${id}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // Deep link: jump straight to the section in the URL on load.
  const initialHash = (window.location.hash || '').replace('#section-', '');
  if (initialHash && document.getElementById(`section-${initialHash}`)) {
    requestAnimationFrame(() => {
      document
        .getElementById(`section-${initialHash}`)
        ?.scrollIntoView({ behavior: 'auto', block: 'start' });
    });
  }

  // Reading progress bar.
  const progressBar = document.querySelector('.progress-bar') as HTMLElement | null;
  function updateProgress() {
    if (!progressBar) return;
    const doc = document.documentElement;
    const total = doc.scrollHeight - window.innerHeight;
    const pct = total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0;
    progressBar.style.width = `${pct}%`;
    progressBar.setAttribute('aria-valuenow', String(Math.round(pct)));
  }
  let ticking = false;
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          updateProgress();
          ticking = false;
        });
      }
    },
    { passive: true },
  );
  updateProgress();

  // Re-render the active viz when its container actually resizes (not on every
  // window resize event). Preserve checklist keyboard focus across the rebuild.
  function reRenderActive() {
    const section = sections.find((s) => s.id === activeSectionId);
    if (!section) return;
    const active = document.activeElement as HTMLElement | null;
    const focusedRow = active?.classList.contains('checklist-row')
      ? active.getAttribute('data-index')
      : null;
    section.mounted = false;
    switchViz(activeSectionId, true);
    if (focusedRow !== null) {
      requestAnimationFrame(() => {
        const row = document.querySelector(
          `.checklist-row[data-index="${focusedRow}"]`,
        ) as HTMLElement | null;
        row?.focus();
      });
    }
    updateProgress();
  }

  const sticky = document.querySelector('.viz-sticky');
  if (sticky && typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => reRenderActive());
    ro.observe(sticky);
  }

  // Checklist reset: clear persisted state and rebuild the active panel.
  document.querySelectorAll('[data-reset-checklist]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const sectionId = btn.getAttribute('data-reset-checklist');
      if (!sectionId) return;
      try {
        localStorage.removeItem(checklistStorageKey(`chart-${sectionId}`));
      } catch {
        /* storage unavailable — nothing to clear */
      }
      const section = sections.find((s) => s.id === sectionId);
      if (section) {
        section.mounted = false;
        switchViz(sectionId, true);
      }
    });
  });

  if (sections.length > 0) {
    switchViz(sections[0].id);
  }

  initThemeToggle();
}

function parseJsonSafe(raw: string | null): unknown {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function initThemeToggle() {
  const toggle = document.querySelector('.theme-toggle') as HTMLElement | null;
  if (!toggle) return;

  const root = document.documentElement;
  const stored = localStorage.getItem('scrolly-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = stored === 'dark' || (!stored && prefersDark);
  if (isDark) {
    root.classList.add('dark-theme');
  }
  const syncToggle = () => {
    const dark = root.classList.contains('dark-theme');
    toggle.setAttribute('aria-pressed', String(dark));
    toggle.setAttribute('aria-label', dark ? 'Включить светлую тему' : 'Включить тёмную тему');
  };
  syncToggle();

  toggle.addEventListener('click', () => {
    root.classList.toggle('dark-theme');
    localStorage.setItem('scrolly-theme', root.classList.contains('dark-theme') ? 'dark' : 'light');
    syncToggle();
  });
}
