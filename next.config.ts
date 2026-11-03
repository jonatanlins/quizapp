import type { NextConfig } from 'next';

const config: NextConfig = {
  // Keep the test server separate from a developer's running Next.js instance.
  distDir: process.env.QUIZAPP_E2E === '1' ? '.next-e2e' : '.next',
};
export default config;
