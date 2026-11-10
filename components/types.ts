import { Layers3, Sparkles, FlaskConical, ShieldCheck, Bot, Eye } from 'lucide-react';

export type Tab = 'explore' | 'progress' | 'leaderboard';
export const categoryName = (id: string) => ({
  'daily': 'Daily Challenge',
  'ai-fundamentals': 'AI Fundamentals',
  'llm-applications': 'LLM Applications',
  'ai-engineering': 'AI Engineering',
  'ai-safety-ethics': 'AI Safety & Ethics',
  'agentic-systems': 'Autonomous Agents',
  'multimodal-ai': 'Multimodal AI',
}[id] ?? id);
export const categoryMeta: Record<string, { number: string; label: string; icon: typeof Layers3; tone: string }> = {
  'ai-fundamentals': { number: '01', label: 'THE FOUNDATION', icon: Layers3, tone: 'lilac' },
  'llm-applications': { number: '02', label: 'THE BUILDING BLOCKS', icon: Sparkles, tone: 'peach' },
  'ai-engineering': { number: '03', label: 'THE PRACTICE', icon: FlaskConical, tone: 'mint' },
  'ai-safety-ethics': { number: '04', label: 'THE ALIGNMENT', icon: ShieldCheck, tone: 'lilac' },
  'agentic-systems': { number: '05', label: 'THE AUTONOMY', icon: Bot, tone: 'peach' },
  'multimodal-ai': { number: '06', label: 'THE SENSES', icon: Eye, tone: 'mint' },
};
