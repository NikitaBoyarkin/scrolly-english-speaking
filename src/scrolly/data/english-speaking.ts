/** Categorical palette for the input-resources viz. Single source of truth:
 * the section legend below references these, and `viz/resources.ts` imports
 * them — change a color here and both stay in sync. */
export const resourceTypeColors: Record<string, string> = {
  Podcast: '#2563eb',
  YouTube: '#dc2626',
  Newsletter: 'var(--secondary)',
  'Docs / Course': '#7c3aed',
};

/** Categorical palette for the AI-tools viz (tier → color). */
export const toolTierColors: Record<string, string> = {
  free: 'var(--secondary)',
  low: 'var(--secondary)',
  mid: '#2563eb',
  high: '#7c3aed',
};

/** Categorical palette for the outcomes viz — the four skill dimensions each
 * scenario trains (pronunciation / fluency / vocabulary / grammar). */
export const outcomeSkillColors: Record<string, string> = {
  pronunciation: '#f59e0b',
  fluency: 'var(--accent)',
  vocabulary: 'var(--secondary)',
  grammar: '#7c3aed',
};

/** Human labels for the four skill dimensions (legend + card tooltips). */
export const outcomeSkillLabels: Record<string, string> = {
  pronunciation: 'Произношение',
  fluency: 'Беглость',
  vocabulary: 'Словарь',
  grammar: 'Грамматика',
};

export const config = {
  configId: 'english-speaking',
  metadata: {
    title: 'Английский для рабочих разговоров: исследование + план',
    description:
      'Практический гайд по улучшению spoken English для работы (уровень A2–B1): AI-инструменты, SRS-словарь, аутентичный input, психология уверенности и 4-недельный план.',
    brand: 'DSWoK',
    // 'home' is a sentinel — the layout resolves the actual href base-aware
    // (BASE_URL subpath on GitHub Pages). Never set an absolute '/' here —
    // that would point at the github.io root, off-site.
    homeNavUrl: 'home',
  },
  hero: {
    label: 'Deep Research · Гайд-исследование',
    titleHtml: 'От замирания на митингах — к уверенному английскому',
    subtitleHtml:
      'Система из AI-speaking, SRS-словаря и comprehensible input: 30–45 минут в день, чтобы через 4 недели открывать митинг, объяснять метрики и отвечать на вопросы без паники.',
    authorsHtml: 'На основе 60+ источников 2024–2026',
    teaserHtml:
      'Минимальный набор: 15–20 мин speaking с AI, 10–15 sentence-карточек в Anki и 10–15 мин аутентичного input каждый день. Устная речь растёт от частых low-stakes разговоров, а не от зубрёжки грамматики.',
    ctaHref: '#section-intro',
    stats: [
      { target: 30, unit: '–45 мин', label: 'в день · ~5 ч/нед' },
      { target: 20, unit: '–30 нед', label: 'до уверенного B1' },
      { target: 6, unit: ' сценариев', label: 'рабочих ситуаций' },
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
        captionHtml:
          'Три блока формируют замкнутый контур: speaking → vocabulary → input → confidence.',
        props: {
          center: { title: '30–45 мин', subtitle: 'каждый день' },
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
          { label: 'Бесплатно / дешево', color: toolTierColors.free },
          { label: 'Средний ценник', color: toolTierColors.mid },
          { label: 'Premium / Enterprise', color: toolTierColors.high },
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
          { label: 'Podcast', color: resourceTypeColors.Podcast },
          { label: 'YouTube', color: resourceTypeColors.YouTube },
          { label: 'Newsletter', color: resourceTypeColors.Newsletter },
          { label: 'Docs / Course', color: resourceTypeColors['Docs / Course'] },
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
        captionHtml:
          'Не акцент, а понятность и готовность начать разговор. Старт — 0, цель — пунктир. Filler words и anxiety: меньше — лучше.',
        props: {
          metrics: [
            { label: 'Speaking-initiation', value: 0, target: 5, unit: 'раз/день' },
            { label: 'Repair-tool usage', value: 0, target: 3, unit: 'раз/митинг' },
            { label: 'Daily practice', value: 0, target: 45, unit: 'мин' },
            { label: 'Filler words', value: 10, target: 4, unit: 'на 100 слов', direction: 'min' },
            { label: 'Post-call anxiety', value: 4, target: 2, unit: '1–5', direction: 'min' },
            { label: 'Perceived intelligibility', value: 50, target: 90, unit: '%' },
          ],
        },
      },
    },
    {
      id: 'outcomes',
      navLabel: 'Результаты',
      mobileLabel: 'Результаты',
      viz: {
        key: 'outcomes',
        title: 'Что меняется после 4 недель',
        mount: 'svg',
        captionHtml:
          'Шесть рабочих сценариев: «до → после» и ключевая фраза. Точки — какие навыки тренирует сценарий.',
        legend: [
          { label: 'Произношение', color: outcomeSkillColors.pronunciation },
          { label: 'Беглость', color: outcomeSkillColors.fluency },
          { label: 'Словарь', color: outcomeSkillColors.vocabulary },
          { label: 'Грамматика', color: outcomeSkillColors.grammar },
        ],
        props: {
          scenarios: [
            {
              title: 'Stand-up update',
              before: 'сбивчивый импровиз',
              after: '60-сек структура',
              phrase: 'Yesterday I … Today I’m on …',
              skills: { pronunciation: false, fluency: true, vocabulary: false, grammar: true },
            },
            {
              title: 'Объяснить метрики VP',
              before: 'увязаю в терминах',
              after: 'язык инсайтов',
              phrase: 'What this means in practice is…',
              skills: { pronunciation: false, fluency: false, vocabulary: true, grammar: true },
            },
            {
              title: 'Согласовать дедлайн',
              before: 'соглашаюсь на всё',
              after: 'polite pushback',
              phrase: 'I understand the priority — here’s the trade-off.',
              skills: { pronunciation: false, fluency: false, vocabulary: true, grammar: true },
            },
            {
              title: 'Tough questions',
              before: 'замираю',
              after: 'работают repair-фразы',
              phrase: 'Could you clarify what you mean by…?',
              skills: { pronunciation: false, fluency: true, vocabulary: false, grammar: true },
            },
            {
              title: 'Питч цифр и результатов',
              before: 'топлю в деталях',
              after: '3 числа + вывод',
              phrase: 'The headline number is X — driven by Y.',
              skills: { pronunciation: false, fluency: true, vocabulary: true, grammar: false },
            },
            {
              title: 'Small talk до митинга',
              before: 'молчу до старта',
              after: 'лёгкий разговор',
              phrase: 'How was your weekend? We’re about to kick off…',
              skills: { pronunciation: true, fluency: false, vocabulary: true, grammar: false },
            },
          ],
        },
      },
    },
    {
      id: 'cefr',
      navLabel: 'Прогресс',
      mobileLabel: 'Прогресс',
      viz: {
        key: 'cefr',
        title: 'Путь по уровням CEFR',
        mount: 'svg',
        captionHtml:
          'Честные сроки при ~5 ч/нед практики. B1 — реалистичная цель для рабочего speaking; C1 «за 32 недели» — маркетинг.',
        props: {
          dailyMinutes: 35,
          levels: [
            {
              level: 'A2',
              weeks: 0,
              marker: 'Вы здесь',
              skill: 'простые фразы, small talk',
              color: 'var(--border)',
            },
            {
              level: 'B1',
              weeks: 30,
              marker: 'Цель плана',
              skill: 'stand-up, метрики, Q&A',
              color: 'var(--accent)',
            },
            {
              level: 'B2',
              weeks: 75,
              marker: 'Следующий шаг',
              skill: 'дедлайны, питчи, дискуссии',
              color: 'var(--secondary)',
            },
            {
              level: 'C1',
              weeks: 150,
              marker: 'Горизонт',
              skill: 'переговоры, выступления',
              color: '#7c3aed',
            },
          ],
        },
      },
    },
    {
      id: 'quiz',
      navLabel: 'Диагностика',
      mobileLabel: 'Диагностика',
      viz: {
        key: 'quiz',
        title: 'Где ты сейчас?',
        mount: 'div',
        captionHtml:
          '4 вопроса — по оси навыка. Ответь честно, получи уровень и рабочий сценарий, с которого начать.',
        props: {
          questions: [
            {
              id: 'fluency',
              label: 'Беглость',
              prompt: 'Насколько плавно ты формулируешь мысль на митинге?',
              options: [
                { label: 'Запинаюсь, долго подбираю слова', score: 0 },
                { label: 'Говорю, но медленно и с паузами', score: 1 },
                { label: 'Говорю уверенно, изредка запинаюсь', score: 2 },
                { label: 'Говорю свободно, почти без пауз', score: 3 },
              ],
            },
            {
              id: 'vocabulary',
              label: 'Словарь',
              prompt: 'Хватает ли слов для рабочих тем?',
              options: [
                { label: 'Только базовые фразы, часто ищу слово', score: 0 },
                { label: 'Хватает на простые рабочие темы', score: 1 },
                { label: 'Хватает на большинство рабочих тем', score: 2 },
                { label: 'Хватает на сложные обсуждения и нюансы', score: 3 },
              ],
            },
            {
              id: 'grammar',
              label: 'Грамматика',
              prompt: 'Насколько уверенно строишь грамматически верные предложения?',
              options: [
                { label: 'Много ошибок, нарушаю понимание', score: 0 },
                { label: 'Ошибки есть, но мысль понятна', score: 1 },
                { label: 'Ошибки редки', score: 2 },
                { label: 'Ошибки почти отсутствуют', score: 3 },
              ],
            },
            {
              id: 'pronunciation',
              label: 'Произношение',
              prompt: 'Насколько хорошо тебя понимают в разговоре?',
              options: [
                { label: 'Часто переспрашивают', score: 0 },
                { label: 'Иногда переспрашивают', score: 1 },
                { label: 'Понимают почти всегда', score: 2 },
                { label: 'Понимают всегда, акцент лёгкий', score: 3 },
              ],
            },
          ],
          levels: [
            {
              min: 0,
              max: 3,
              label: 'Начало пути · A1–A2',
              hint: 'Всё впереди: начни с ритма и low-stakes практики.',
            },
            {
              min: 4,
              max: 6,
              label: 'Разогрев · A2',
              hint: 'База есть, не хватает стабильности. Фокус — ежедневный ритм.',
            },
            {
              min: 7,
              max: 9,
              label: 'Уверенный старт · B1',
              hint: 'Ты почти готов к рабочим разговорам. Дожимай слабые оси.',
            },
            {
              min: 10,
              max: 12,
              label: 'Шлифовка · B1+',
              hint: 'Осталось отполировать нюансы и добавить уверенности.',
            },
          ],
          recommendations: {
            fluency: { scenario: 'Stand-up update', phrase: 'Yesterday I … Today I’m on …' },
            vocabulary: {
              scenario: 'Объяснить метрики VP',
              phrase: 'What this means in practice is…',
            },
            grammar: {
              scenario: 'Согласовать дедлайн',
              phrase: 'I understand the priority — here’s the trade-off.',
            },
            pronunciation: {
              scenario: 'Small talk до митинга',
              phrase: 'How was your weekend? We’re about to kick off…',
            },
          },
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
        captionHtml:
          'Неделя 1 — setup и ритм. Недели 2–4 — удержание и рост. Полная ширина бара = недельная цель.',
        legend: [
          { label: 'Speaking-сессии (цель 7/нед)', color: 'var(--accent)' },
          { label: 'Новые карточки (цель 60/нед)', color: 'var(--secondary)' },
        ],
        props: {
          speakTarget: 7,
          cardsTarget: 60,
          weeks: [
            {
              week: 1,
              focus: 'Setup + ритм',
              speak: 5,
              cards: 35,
              inputMin: 10,
              milestones: [
                'Настроить ChatGPT Voice / Loora',
                'Создать Anki deck',
                'Выбрать 2–3 input-ресурса',
              ],
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
              milestones: [
                'Добавить shadowing 2 мин/день',
                'Self-recorded summary',
                'Анализ filler words',
              ],
            },
            {
              week: 4,
              focus: 'Оценка и масштаб',
              speak: 6,
              cards: 50,
              inputMin: 15,
              milestones: [
                'Ретроспектива по метрикам',
                'Добавить ELSA/Loora при необходимости',
                'План следующего месяца',
              ],
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
