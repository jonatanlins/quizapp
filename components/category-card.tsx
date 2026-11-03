'use client';

import { ArrowRight, BookOpen, Clock3 } from 'lucide-react';
import type { Category } from '@/lib/client/api';
import { categoryMeta } from './types';

export function CategoryCard({ category, onStart, disabled }: { category: Category; onStart: () => void; disabled: boolean }) {
  const meta = categoryMeta[category.id] ?? { number: '•', label: 'EXPLORE', icon: BookOpen, tone: 'lilac' }; const Icon = meta.icon;
  return <article className={`category ${meta.tone}`}><div className="category-top"><div className="category-icon"><Icon size={24} strokeWidth={1.7}/></div><span className="category-index">{meta.number} / 03</span></div><div className="category-copy"><span className="category-label">{meta.label}</span><h3>{category.name}</h3><p>{category.description}</p></div><div className="category-bottom"><span><Clock3 size={15}/> 5 questions <i/> ~3 min</span><button onClick={onStart} disabled={disabled} aria-label={`Start ${category.name}`}><ArrowRight size={20}/></button></div></article>;
}
