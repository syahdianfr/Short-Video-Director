// Render one still per frame number to out/stills/fNNNN.png (bundles once).
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition, openBrowser} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const frames = process.argv[2].split(',').map(Number);
const outDir = process.argv[3] ?? 'out/stills';
const scale = Number(process.argv[4] ?? 0.5);
fs.mkdirSync(outDir, {recursive: true});
const browserExecutable = process.env.REMOTION_BROWSER || '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const chromiumOptions = {gl: process.env.REMOTION_GL || 'swangle'};
const serveUrl = await bundle({entryPoint: path.resolve(process.env.ENTRY || 'src/index.ts')});
const browser = await openBrowser('chrome', {browserExecutable, chromiumOptions});
const composition = await selectComposition({serveUrl, id: process.env.COMP || 'Main', puppeteerInstance: browser, chromiumOptions, inputProps: {mute: true}});
for (const f of frames) {
  const t0 = Date.now();
  await renderStill({composition, serveUrl, frame: f, output: `${outDir}/f${String(f).padStart(4, '0')}.jpg`, imageFormat: 'jpeg', inputProps: {mute: true}, puppeteerInstance: browser, chromiumOptions, scale});
  console.log('frame', f, Date.now() - t0, 'ms');
}
await browser.close({silent: true});
