import { Config } from '@remotion/cli/config';
import fs from 'node:fs';

const chromeCandidates = [
  process.env.REMOTION_CHROME,
  '/run/current-system/sw/bin/google-chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
].filter(Boolean) as string[];

const chromePath = chromeCandidates.find((p) => fs.existsSync(p));

if (chromePath) {
  Config.setBrowserExecutable(chromePath);
}
