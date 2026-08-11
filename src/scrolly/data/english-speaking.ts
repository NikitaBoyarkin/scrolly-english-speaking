export const config = {
  configId: 'english-speaking',
  metadata: {
    title: 'Английский для рабочих разговоров: исследование + план',
    description:
      'Практический гайд по улучшению spoken English для работы (уровень A2–B1): AI-инструменты, SRS-словарь, аутентичный input, психология уверенности и 4-недельный план.',
    brand: 'DSWoK',
    homeNavUrl: '/',
  },
  hero: {
    label: 'Deep Research',
    titleHtml: 'Английский для рабочих разговоров',
    subtitleHtml: 'A2–B1: как перестать заикаться на митингах и начать говорить уверенно',
    authorsHtml: 'На основе 60+ источников 2024–2026',
    teaserHtml:
      'Минимальный набор: 15–20 мин speaking с AI, 10–15 sentence-карточек в Anki и 10–15 мин аутентичного input каждый день. Устная речь растёт от частых low-stakes разговоров, а не от зубрёжки грамматики.',
    ctaHref: '#section-intro',
    stats: [
      { target: 30, unit: '–45 мин', label: 'ежедневно' },
      { target: 60, unit: '+', label: 'источников' },
      { target: 4, unit: ' недели', label: 'стартовый план' },
    ],
  },
  theme: {
    accent: '#2563eb',
    paper: '#ffffff',
    paperDark: '#f7f7f7',
    ink: '#111111',
    secondary: '#06d6a0',
  },
  sections: [
    {
      id: 'intro',
      navLabel: 'Суть',
      mobileLabel: 'Суть',
      viz: {
        key: 'workflow',
        title: 'Ежедневный цикл улучшения речи',
        mount: 'svg',
        captionHtml: 'Три блока формируют замкнутый контур: speaking → vocabulary → input → confidence.',
        props: {
          steps: [
            { id: 'speak', label: 'Speaking', minutes: '15–20 мин', color: '#2563eb' },
            { id: 'vocab', label: 'Vocabulary', minutes: '10 мин', color: '#06d6a0' },
            { id: 'input', label: 'Input', minutes: '10–15 мин', color: '#f59e0b' },
            { id: 'confidence', label: 'Confidence', minutes: '← результат', color: '#7c3aed' },
          ],
        },
      },
    },
    {
      id: 'ai-tools',
      navLabel: 'AI-speaking',
      mobileLabel: 'AI-speaking',
      viz: {
        key: 'tools',
        title: 'AI-инструменты для spoken practice',
        mount: 'svg',
        captionHtml: 'Сравнение по цене и бизнес-специфике. ChatGPT Voice — лучшая точка входа.',
        legend: [
          { label: 'Бесплатно / дешево', color: '#06d6a0' },
          { label: 'Средний ценник', color: '#2563eb' },
          { label: 'Premium / Enterprise', color: '#7c3aed' },
        ],
        props: {
          tools: [
            { name: 'ChatGPT Voice', price: 0, businessScore: 5, tier: 'free' },
            { name: 'Talkio AI', price: 10, businessScore: 4, tier: 'low' },
            { name: 'TalkMe', price: 13, businessScore: 5, tier: 'mid' },
            { name: 'ELSA Speak', price: 13.33, businessScore: 7, tier: 'mid' },
            { name: 'Loora', price: 16, businessScore: 9, tier: 'mid' },
            { name: 'Speak', price: 22, businessScore: 9, tier: 'high' },
            { name: 'Babbel', price: 11.2, businessScore: 6, tier: 'mid' },
          ],
        },
      },
    },
    {
      id: 'vocab',
      navLabel: 'Словарь',
      mobileLabel: 'Словарь',
      viz: {
        key: 'bars',
        title: 'SRS-нагрузка и retention',
        mount: 'svg',
        captionHtml: 'Дневная норма working professional. Целевой retention FSRS: 90–92%.',
        props: {
          items: [
            { label: 'Новых карточек', value: 12.5, max: 20, unit: 'шт/день', color: '#2563eb' },
            { label: 'Review cap', value: 150, max: 200, unit: 'карт/день', color: '#06d6a0' },
            { label: 'Retention', value: 91, max: 100, unit: '%', color: '#f59e0b' },
            { label: 'Время', value: 25, max: 45, unit: 'мин/день', color: '#7c3aed' },
          ],
        },
      },
    },
    {
      id: 'input',
      navLabel: 'Input',
      mobileLabel: 'Input',
      viz: {
        key: 'resources',
        title: 'Ресурсы по типу и уровню',
        mount: 'svg',
        captionHtml: 'Принцип comprehensible input: 70–90% понимания. Transcripts обязательны.',
        legend: [
          { label: 'Podcast', color: '#2563eb' },
          { label: 'YouTube', color: '#dc2626' },
          { label: 'Newsletter', color: '#06d6a0' },
          { label: 'Docs / Course', color: '#7c3aed' },
        ],
        props: {
          resources: [
            { name: 'BBC 6 Minute English', type: 'Podcast', level: 1.5 },
            { name: 'Business English Pod', type: 'Podcast', level: 2 },
            { name: 'All Ears English', type: 'Podcast', level: 2 },
            { name: 'Down to Business English', type: 'Podcast', level: 2 },
            { name: 'Data & AI with Mukundan', type: 'Podcast', level: 1.5 },
            { name: 'HBR IdeaCast', type: 'Podcast', level: 2.5 },
            { name: 'StatQuest', type: 'YouTube', level: 2 },
            { name: 'Mo Chen', type: 'YouTube', level: 1.5 },
            { name: 'Data with Decision', type: 'YouTube', level: 1.5 },
            { name: 'Data Analysis Journal', type: 'Newsletter', level: 2 },
            { name: 'Analytics: Explained', type: 'Newsletter', level: 2 },
            { name: "Lenny's Newsletter", type: 'Newsletter', level: 2.5 },
            { name: 'Ploomber SQL Course', type: 'Docs / Course', level: 1.5 },
          ],
        },
      },
    },
    {
      id: 'confidence',
      navLabel: 'Уверенность',
      mobileLabel: 'Уверенность',
      viz: {
        key: 'metrics',
        title: 'Метрики прогресса уверенности',
        mount: 'svg',
        captionHtml: 'Не акцент, а понятность и готовность начать разговор.',
        props: {
          metrics: [
            { label: 'Speaking-initiation', value: 0, target: 5, unit: 'раз/день' },
            { label: 'Repair-tool usage', value: 0, target: 3, unit: 'раз/митинг' },
            { label: 'Daily practice', value: 0, target: 45, unit: 'мин' },
            { label: 'Filler words', value: 10, target: 4, unit: 'на 100 слов' },
            { label: 'Post-call anxiety', value: 4, target: 2, unit: '1–5' },
            { label: 'Perceived intelligibility', value: 50, target: 90, unit: '%' },
          ],
        },
      },
    },
    {
      id: 'plan',
      navLabel: 'План',
      mobileLabel: 'План',
      viz: {
        key: 'calendar',
        title: '4-недельный старт',
        mount: 'svg',
        captionHtml: 'Неделя 1 — setup и ритм. Недели 2–4 — удержание и постепенный рост.',
        props: {
          weeks: [
            {
              week: 1,
              focus: 'Setup + ритм',
              speak: 5,
              cards: 35,
              inputMin: 10,
              milestones: ['Настроить ChatGPT Voice / Loora', 'Создать Anki deck', 'Выбрать 2–3 input-ресурса'],
            },
            {
              week: 2,
              focus: 'Удержание',
              speak: 5,
              cards: 40,
              inputMin: 12,
              milestones: ['5–6 speaking-сессий', '30–50 новых карточек', '10-минутный review'],
            },
            {
              week: 3,
              focus: 'Автоматизация',
              speak: 6,
              cards: 45,
              inputMin: 15,
              milestones: ['Добавить shadowing 2 мин/день', 'Self-recorded summary', 'Анализ filler words'],
            },
            {
              week: 4,
              focus: 'Оценка и масштаб',
              speak: 6,
              cards: 50,
              inputMin: 15,
              milestones: ['Ретроспектива по метрикам', 'Добавить ELSA/Loora при необходимости', 'План следующего месяца'],
            },
          ],
        },
      },
    },
    {
      id: 'start',
      navLabel: 'Старт',
      mobileLabel: 'Старт',
      viz: {
        key: 'checklist',
        title: 'С чего начать сегодня',
        mount: 'svg',
        captionHtml: '7 шагов. Отметь выполненное — и завтра повтори.',
        props: {
          items: [
            { label: 'Установить ChatGPT / открыть веб-версию', done: false },
            { label: 'Создать Anki deck «Work English — DS/Analytics»', done: false },
            { label: 'Добавить 10 sentence cards из рабочих писем/Slack', done: false },
            { label: 'Выбрать 1 podcast (BBC 6 Minute English)', done: false },
            { label: 'Провести 1 AI-speaking-сессию по сценарию stand-up', done: false },
            { label: 'Записать 60-секундный self-summary и прослушать', done: false },
            { label: 'Настроить ежедневный reminder на 30–45 мин', done: false },
          ],
        },
      },
    },
  ],
  footerHtml:
    '<p><strong>Методология:</strong> обзор основан на 60+ источниках 2024–2026 по AI-speaking инструментам, SRS, comprehensible input и психологии speaking anxiety. Полный список источников — в исходной заметке.</p>',
};
