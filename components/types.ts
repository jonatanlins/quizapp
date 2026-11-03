import { Layers3, Sparkles, FlaskConical } from 'lucide-react';

export type Tab = 'explore' | 'progress' | 'leaderboard';
export const categoryName = (id: string) => ({ 'daily': 'Daily Challenge', 'ai-fundamentals': 'AI Fundamentals', 'llm-applications': 'LLM Applications', 'ai-engineering': 'AI Engineering' }[id] ?? id);
export const categoryMeta: Record<string, { number: string; label: string; icon: typeof Layers3; tone: string }> = {
  'ai-fundamentals': { number: '01', label: 'THE FOUNDATION', icon: Layers3, tone: 'lilac' },
  'llm-applications': { number: '02', label: 'THE BUILDING BLOCKS', icon: Sparkles, tone: 'peach' },
  'ai-engineering': { number: '03', label: 'THE PRACTICE', icon: FlaskConical, tone: 'mint' },
};
