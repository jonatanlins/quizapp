'use client';

import { ArrowRight, BookOpen, CircleAlert, LoaderCircle } from 'lucide-react';

export function Loading({ text }: { text: string }) {
  return (
    <div className="state-box" role="status">
      <LoaderCircle className="spin" size={20} />
      <span>{text}</span>
    </div>
  );
}
export function ErrorBox({ text, retry }: { text: string; retry?: () => void }) {
  return (
    <div className="notice error" role="alert">
      <CircleAlert size={19} />
      <div>
        <strong>Something needs your attention</strong>
        <p>{text}</p>
        {retry && (
          <button className="text-button" onClick={retry}>
            Try again <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
export function Empty({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <BookOpen size={23} />
      </div>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
