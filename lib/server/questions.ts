import { createHash, randomInt } from 'node:crypto';
import bank from '../../data/questions.json';

export type Question = { id: string; categoryId: string; prompt: string; options: { id: string; text: string }[]; correctOptionId: string; explanation: string; learnNote: string };
export const categories = bank.categories;
export const questions: Question[] = bank.questions;

export function shuffled<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) { const j = randomInt(i + 1); [result[i], result[j]] = [result[j], result[i]]; }
  return result;
}

// Hashing stable question IDs makes selection independent of the source JSON order.
// The date is selected by the server in UTC and pinned to the session at start.
export function compareRankedQuestions(a: { id: string; rank: string }, b: { id: string; rank: string }): number {
  return a.rank.localeCompare(b.rank) || a.id.localeCompare(b.id);
}

export function dailyQuestions(date: string): Question[] {
  return questions.map(question => ({ question, id: question.id, rank: createHash('sha256').update(`quizapp-daily-v1:${date}:${question.id}`).digest('hex') }))
    .sort(compareRankedQuestions).slice(0, 5).map(item => item.question);
}
