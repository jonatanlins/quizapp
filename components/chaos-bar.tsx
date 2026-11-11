'use client';

import { Activity, ChevronDown } from 'lucide-react';
import type { Chaos } from '@/lib/client/api';
import { useQuiz } from '@/lib/client/store';

export function ChaosBar() {
  const { chaos, setChaos } = useQuiz();
  const chaosAvailable = process.env.NODE_ENV !== 'production';

  return (
    <div className="chaos-bar">
      <div className="chaos-inner">
        <div className="chaos-title">
          <Activity size={15} />
          <strong>Chaos bar</strong>
          <span>Test how the app handles errors</span>
        </div>
        <div className="chaos-controls">
          <span className={chaos === 'off' ? 'status-dot' : 'status-dot active'} />
          <label htmlFor="chaos">
            {!chaosAvailable
              ? 'Available in development'
              : chaos === 'off'
                ? 'All systems normal'
                : 'Simulation active'}
          </label>
          <div className="select-wrap">
            <select
              id="chaos"
              disabled={!chaosAvailable}
              value={chaos}
              onChange={(e) => setChaos(e.target.value as Chaos)}
            >
              <option value="off">No errors</option>
              <option value="before">Fail before request</option>
              <option value="after">Lose response</option>
            </select>
            <ChevronDown size={13} />
          </div>
        </div>
      </div>
    </div>
  );
}
