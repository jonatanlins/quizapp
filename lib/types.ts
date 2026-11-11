import { z } from 'zod';

export const uuidSchema = z.string().uuid();

export const optionSchema = z.object({
  id: uuidSchema,
  text: z.string(),
});

export const questionSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  options: z.array(optionSchema),
  learnNote: z.string().optional(),
});

export const feedbackSchema = z.object({
  questionId: z.string(),
  selectedOptionId: uuidSchema,
  correctOptionId: uuidSchema,
  correct: z.boolean(),
  explanation: z.string(),
  prompt: z.string(),
  options: z.array(optionSchema),
});

export const resultSchema = z.object({
  sessionId: uuidSchema,
  categoryId: z.string(),
  username: z.string(),
  learnMode: z.boolean(),
  dailyDate: z.string().optional(),
  score: z.number(),
  total: z.number(),
  percentage: z.number(),
  completedAt: z.string(),
  message: z.string(),
  missed: z.array(feedbackSchema),
});

const sessionBase = {
  id: uuidSchema,
  categoryId: z.string(),
  username: z.string(),
  learnMode: z.boolean(),
  dailyDate: z.string().optional(),
  progress: z.object({ current: z.number(), total: z.number() }),
  createdAt: z.string(),
};

export const sessionSchema = z.discriminatedUnion('state', [
  z.object({
    ...sessionBase,
    state: z.literal('question_ready'),
    question: questionSchema,
  }),
  z.object({
    ...sessionBase,
    state: z.literal('feedback'),
    question: questionSchema,
    feedback: feedbackSchema,
  }),
  z.object({
    ...sessionBase,
    state: z.literal('completed'),
    results: resultSchema,
  }),
]);

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  questionCount: z.number(),
});

export const categoriesSchema = z.object({
  categories: z.array(categorySchema),
});

export const leaderboardRowSchema = z.object({
  userId: z.string(),
  username: z.string(),
  learnMode: z.boolean(),
  correct: z.number(),
  attempts: z.number(),
  questions: z.number(),
});

export const leaderboardSchema = z.object({
  standard: z.array(leaderboardRowSchema),
  learn: z.array(leaderboardRowSchema),
});

export const startPayloadSchema = z.object({
  categoryId: z.string().min(1).max(100),
  userId: uuidSchema,
  username: z.string().trim().min(1).max(40),
  learnMode: z.boolean(),
});

export const answerPayloadSchema = z.object({
  questionId: z.string().min(1).max(100),
  optionId: uuidSchema,
});

export const advancePayloadSchema = z.object({
  questionId: z.string().min(1).max(100),
});

export const startResponseSchema = z.object({
  token: z.string(),
  session: sessionSchema,
});

export const apiResponseSchema = z.union([
  categoriesSchema,
  leaderboardSchema,
  startResponseSchema,
  sessionSchema,
]);

export type Option = z.infer<typeof optionSchema>;
export type Question = z.infer<typeof questionSchema>;
export type Feedback = z.infer<typeof feedbackSchema>;
export type Result = z.infer<typeof resultSchema>;
export type Session = z.infer<typeof sessionSchema>;
export type Category = z.infer<typeof categorySchema>;
export type LeaderboardRow = z.infer<typeof leaderboardRowSchema>;
export type Leaderboard = z.infer<typeof leaderboardSchema>;
export type StartPayload = z.infer<typeof startPayloadSchema>;
export type AnswerPayload = z.infer<typeof answerPayloadSchema>;
export type AdvancePayload = z.infer<typeof advancePayloadSchema>;
export type StartResponse = z.infer<typeof startResponseSchema>;
export type Chaos = 'off' | 'before' | 'after';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string);
  constructor(message: string, code?: string, status?: number);
  constructor(
    statusOrMessage: number | string,
    code = 'SERVER_ERROR',
    statusOrMessage2?: number | string
  ) {
    if (typeof statusOrMessage === 'number') {
      super(typeof statusOrMessage2 === 'string' ? statusOrMessage2 : '');
      this.status = statusOrMessage;
      this.code = code;
    } else {
      super(statusOrMessage);
      this.code = code;
      this.status = typeof statusOrMessage2 === 'number' ? statusOrMessage2 : 0;
    }
  }
}
