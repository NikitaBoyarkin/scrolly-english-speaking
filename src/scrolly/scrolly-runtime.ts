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
  let resizeTimeout: ReturnType<typeof setTimeout> | null = null;

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
        document
          .getElementById(`section-${target}`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  window.addEventListener('resize', () => {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (activeSectionId) {
        const section = sections.find((s) => s.id === activeSectionId);
        if (section) section.mounted = false;
        switchViz(activeSectionId, true);
      }
    }, 250);
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
