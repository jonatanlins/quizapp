'use client';

import { Activity, ChevronDown } from 'lucide-react';
import { useQuiz } from '@/lib/client/store';
import type { Chaos } from '@/lib/client/api';
import type { Tab } from './types';

export function Header({ tab, change }: { tab: Tab; change: (tab: Tab) => void }) {
  const { chaos, setChaos } = useQuiz(); const chaosAvailable = process.env.NODE_ENV !== 'production';
  return <><div className="chaos-bar"><div className="chaos-inner"><div className="chaos-title"><Activity size={15}/><strong>Chaos bar</strong><span>Test how the app handles errors</span></div><div className="chaos-controls"><span className={chaos === 'off' ? 'status-dot' : 'status-dot active'}/><label htmlFor="chaos">{!chaosAvailable ? 'Available in development' : chaos === 'off' ? 'All systems normal' : 'Simulation active'}</label><div className="select-wrap"><select id="chaos" disabled={!chaosAvailable} value={chaos} onChange={e => setChaos(e.target.value as Chaos)}><option value="off">No errors</option><option value="before">Fail before request</option><option value="after">Lose response</option></select><ChevronDown size={13}/></div></div></div></div>
    <header className="header"><div className="header-inner"><button className="brand" onClick={() => change('explore')} aria-label="QuizApp home"><span className="brand-mark"><span>q</span><i/></span><span>quiz<span className="brand-light">app</span><b>.</b></span></button><nav aria-label="Main navigation"><button className={tab === 'explore' ? 'nav-active' : ''} onClick={() => change('explore')}>Explore</button><button className={tab === 'progress' ? 'nav-active' : ''} onClick={() => change('progress')}>My progress</button><button className={tab === 'leaderboard' ? 'nav-active' : ''} onClick={() => change('leaderboard')}>Leaderboard</button></nav><div className="header-note"><span className="tiny-dot"/> A LITTLE SMARTER, EVERY DAY</div></div></header></>;
}
