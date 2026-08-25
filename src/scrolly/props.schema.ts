/**
 * Per-renderer prop schemas — the authoritative contract for every viz's
 * `props` payload. Bound by `config.schema.ts` (superRefine per section) and
 * `tests/config.test.ts`: a malformed prop shape fails the schema instead of
 * reaching a renderer that silently draws nothing.
 *
 * The derived types are the single source of truth for the renderers' prop
 * signatures (`import type { XProps } from '../props.schema'`), so the schema
 * and the code that consumes props cannot drift.
 *
 * NOTE: `import type { VizKey }` from config.schema is erased at runtime — this
 * module must never value-import config.schema (that would create a cycle).
 */
import { z } from 'zod';
import type { VizKey } from './config.schema';

/* workflow — daily loop, ring of steps around a center */
export const workflowStepSchema = z.strictObject({
  id: z.string(),
  label: z.string(),
  minutes: z.string(),
  color: z.string(),
});
export const workflowPropsSchema = z.strictObject({
  steps: z.array(workflowStepSchema).optional(),
  center: z
    .strictObject({ title: z.string().optional(), subtitle: z.string().optional() })
    .optional(),
});
export type WorkflowProps = z.infer<typeof workflowPropsSchema>;

/* tools — price × business-specificity scatter */
export const toolSchema = z.strictObject({
  name: z.string(),
  price: z.number(),
  businessScore: z.number(),
  tier: z.string(),
  recommended: z.boolean().optional(),
});
export const toolsPropsSchema = z.strictObject({ tools: z.array(toolSchema).optional() });
export type ToolsProps = z.infer<typeof toolsPropsSchema>;
export type Tool = z.infer<typeof toolSchema>;

/* bars — SRS-load bars (value / max) */
export const barItemSchema = z.strictObject({
  label: z.string(),
  value: z.number(),
  max: z.number(),
  unit: z.string(),
  color: z.string(),
});
export const barsPropsSchema = z.strictObject({ items: z.array(barItemSchema).optional() });
export type BarsProps = z.infer<typeof barsPropsSchema>;

/* resources — type/level scatter */
export const resourceSchema = z.strictObject({
  name: z.string(),
  type: z.string(),
  level: z.number(),
  recommended: z.boolean().optional(),
});
export const resourcesPropsSchema = z.strictObject({
  resources: z.array(resourceSchema).optional(),
});
export type ResourcesProps = z.infer<typeof resourcesPropsSchema>;
export type Resource = z.infer<typeof resourceSchema>;

/* metrics — progress bars with a target and an optional good direction */
export const metricSchema = z.strictObject({
  label: z.string(),
  value: z.number(),
  target: z.number(),
  unit: z.string(),
  direction: z.enum(['min', 'max']).optional(),
});
export const metricsPropsSchema = z.strictObject({ metrics: z.array(metricSchema).optional() });
export type MetricsProps = z.infer<typeof metricsPropsSchema>;
export type Metric = z.infer<typeof metricSchema>;

/* outcomes — «до → после» scenario cards with a skill-skill composition */
export const outcomeScenarioSchema = z.strictObject({
  title: z.string(),
  before: z.string(),
  after: z.string(),
  phrase: z.string(),
  skills: z.strictObject({
    pronunciation: z.boolean(),
    fluency: z.boolean(),
    vocabulary: z.boolean(),
    grammar: z.boolean(),
  }),
});
export const outcomesPropsSchema = z.strictObject({
  scenarios: z.array(outcomeScenarioSchema).optional(),
});
export type OutcomesProps = z.infer<typeof outcomesPropsSchema>;
export type OutcomeScenario = z.infer<typeof outcomeScenarioSchema>;

/* cefr — level ladder with cumulative weeks */
export const cefrLevelSchema = z.strictObject({
  level: z.string(),
  weeks: z.number(),
  marker: z.string(),
  skill: z.string(),
  color: z.string(),
});
export const cefrPropsSchema = z.strictObject({
  levels: z.array(cefrLevelSchema).optional(),
  dailyMinutes: z.number().optional(),
});
export type CefrProps = z.infer<typeof cefrPropsSchema>;
export type CefrLevel = z.infer<typeof cefrLevelSchema>;

/* quiz — self-assessment wizard */
export const quizOptionSchema = z.strictObject({ label: z.string(), score: z.number() });
export const quizQuestionSchema = z.strictObject({
  id: z.string(),
  label: z.string(),
  prompt: z.string(),
  options: z.array(quizOptionSchema),
});
export const quizLevelSchema = z.strictObject({
  min: z.number(),
  max: z.number(),
  label: z.string(),
  hint: z.string(),
});
export const quizRecommendationSchema = z.strictObject({
  scenario: z.string(),
  phrase: z.string(),
});
export const quizPropsSchema = z.strictObject({
  title: z.string().optional(),
  questions: z.array(quizQuestionSchema),
  levels: z.array(quizLevelSchema),
  recommendations: z.record(z.string(), quizRecommendationSchema),
});
export type QuizProps = z.infer<typeof quizPropsSchema>;
export type QuizOption = z.infer<typeof quizOptionSchema>;
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type QuizLevel = z.infer<typeof quizLevelSchema>;
export type QuizRecommendation = z.infer<typeof quizRecommendationSchema>;

/* calendar — weekly plan bars */
export const weekPlanSchema = z.strictObject({
  week: z.number(),
  focus: z.string(),
  speak: z.number(),
  cards: z.number(),
  inputMin: z.number(),
  milestones: z.array(z.string()),
});
export const calendarPropsSchema = z.strictObject({
  weeks: z.array(weekPlanSchema).optional(),
  speakTarget: z.number().optional(),
  cardsTarget: z.number().optional(),
});
export type CalendarProps = z.infer<typeof calendarPropsSchema>;

/* checklist — persisted done-state list */
export const checklistItemSchema = z.strictObject({ label: z.string(), done: z.boolean() });
export const checklistPropsSchema = z.strictObject({
  items: z.array(checklistItemSchema).optional(),
});
export type ChecklistProps = z.infer<typeof checklistPropsSchema>;
export type ChecklistItem = z.infer<typeof checklistItemSchema>;

/** Keyed exactly by the runtime's renderer map (`scrolly-runtime.ts`). */
export const VIZ_PROPS_SCHEMAS: Record<VizKey, z.ZodTypeAny> = {
  workflow: workflowPropsSchema,
  tools: toolsPropsSchema,
  bars: barsPropsSchema,
  resources: resourcesPropsSchema,
  metrics: metricsPropsSchema,
  outcomes: outcomesPropsSchema,
  cefr: cefrPropsSchema,
  quiz: quizPropsSchema,
  calendar: calendarPropsSchema,
  checklist: checklistPropsSchema,
};
