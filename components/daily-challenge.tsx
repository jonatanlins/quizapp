'use client';

import { ArrowRight, CalendarDays, Sparkles } from 'lucide-react';
import { useQuiz } from '@/lib/client/store';

export function DailyChallenge() {
  const { start, busy, pending, username, error } = useQuiz();
  return <section className="daily-wrap" aria-labelledby="daily-title"><div className="daily-card"><div className="daily-content"><span className="daily-label"><CalendarDays size={15}/> A FRESH CHALLENGE EVERY DAY</span><h2 id="daily-title">A little spark<br/><em>for today.</em></h2><p>Five questions from across AI. The same challenge for everyone, with a new set each day.</p><button className="daily-button" disabled={busy || !!pending} onClick={() => void start('daily')}>Take the daily challenge <ArrowRight size={17}/></button>{!username.trim() && error && <p className="daily-error" role="alert">Enter your username above to start.</p>}<small>RESETS AT MIDNIGHT UTC · 5 QUESTIONS</small></div><div className="daily-art" aria-hidden="true"><div className="daily-orbit orbit-a"/><div className="daily-orbit orbit-b"/><span className="daily-star"><Sparkles size={39}/></span><span className="daily-five">5</span><span className="daily-art-caption">QUESTIONS<br/>ONE BRIGHT IDEA</span></div></div></section>;
}
