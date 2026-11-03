import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'QuizApp — learn AI by doing', description: 'Short quizzes for curious AI builders.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
