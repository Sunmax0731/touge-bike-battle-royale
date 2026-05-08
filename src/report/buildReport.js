import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { product } from '../core/product.js';
import { buildQcdsEvaluation } from '../review-model/qcdsModel.js';
import { createDeterministicZip } from './zip.js';

const repoRoot = path.resolve(path.join(path.dirname(fileURLToPath(import.meta.url)), '../..'));
const docsEntries = ["README.md","AGENTS.md","SKILL.md","docs/requirements.md","docs/specification.md","docs/design.md","docs/implementation-plan.md","docs/test-plan.md","docs/manual-test.md","docs/installation-guide.md","docs/user-guide.md","docs/release-checklist.md","docs/responsibility-map.md","docs/ui-ux-polish.md","docs/post-mvp-roadmap.md","docs/competitive-benchmark.md","docs/evaluation-criteria.md","docs/qcds-evaluation.md","docs/qcds-remote-benchmark.md","docs/qcds-strict-gap-analysis.md","docs/qcds-strict-metrics.json","docs/qcds-regression-baseline.json","docs/security-privacy-checklist.md","docs/traceability-matrix.md","docs/strict-manual-test-addendum.md","docs/source-idea-pack.json","docs/release-evidence.json","docs/releases/v0.1.0-alpha.1.md"];
const gradeOrder = ['D-','D+','C-','C+','B-','B+','A-','A+','S-','S+'];
const mojibakeCodePoints = [0x7e67, 0x90e2, 0x9aeb, 0xfffd];
const scenarioIds = ['happy-path','missing-required','warning','mixed-batch'];
const docsZipRel = `dist/${product.repo}-docs.zip`;

function writeJson(rel, payload) {
  const out = path.join(repoRoot, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(payload, null, 2) + '\n', 'utf8');
}
function scanMojibake() {
  const fragments = mojibakeCodePoints.map((codePoint) => String.fromCodePoint(codePoint));
  const hits = [];
  function walk(rel) {
    const full = path.join(repoRoot, rel);
    if (!fs.existsSync(full)) return;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      for (const child of fs.readdirSync(full)) walk(path.join(rel, child));
      return;
    }
    if (/\.(md|json|js|html|css|svg)$/.test(rel)) {
      const text = fs.readFileSync(full, 'utf8');
      if (fragments.some((fragment) => text.includes(fragment))) hits.push(rel.replace(/\\/g, '/'));
    }
  }
  ['README.md','AGENTS.md','SKILL.md','package.json','docs','src','samples','data','assets','index.html','public/index.html'].forEach(walk);
  return hits;
}
function findChrome() {
  return [process.env.CHROME_PATH,'C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Google/Chrome/Application/chrome.exe','C:/Program Files/Microsoft/Edge/Application/msedge.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].filter(Boolean).find((candidate) => fs.existsSync(candidate));
}
function serveFile(req, res) {
  const url = new URL(req.url || '/', 'http://127.0.0.1');
  const requested = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname).replace(/^\/+/, '');
  if (requested.includes('..')) { res.writeHead(403); res.end('forbidden'); return; }
  const full = path.join(repoRoot, requested);
  if (!full.startsWith(repoRoot) || !fs.existsSync(full) || fs.statSync(full).isDirectory()) { res.writeHead(404); res.end('not found'); return; }
  const ext = path.extname(full);
  const type = ext === '.js' ? 'text/javascript; charset=utf-8' : ext === '.css' ? 'text/css; charset=utf-8' : ext === '.html' ? 'text/html; charset=utf-8' : ext === '.svg' ? 'image/svg+xml; charset=utf-8' : 'application/octet-stream';
  res.writeHead(200, { 'content-type': type, 'cache-control': 'no-store' });
  res.end(fs.readFileSync(full));
}
function listen(server) {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server.address().port));
  });
}
function paeth(left, up, upLeft) {
  const p = left + up - upLeft;
  const pa = Math.abs(p - left);
  const pb = Math.abs(p - up);
  const pc = Math.abs(p - upLeft);
  return pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
}
function analyzePng(file) {
  const png = fs.readFileSync(file);
  if (png.length < 1000 || png.toString('ascii', 1, 4) !== 'PNG') return { ok: false };
  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idat = [];
  while (offset < png.length) {
    const length = png.readUInt32BE(offset); offset += 4;
    const type = png.toString('ascii', offset, offset + 4); offset += 4;
    const data = png.subarray(offset, offset + length); offset += length + 4;
    if (type === 'IHDR') { width = data.readUInt32BE(0); height = data.readUInt32BE(4); bitDepth = data[8]; colorType = data[9]; }
    if (type === 'IDAT') idat.push(data);
    if (type === 'IEND') break;
  }
  if (bitDepth !== 8 || ![2, 6].includes(colorType) || !width || !height) return { ok: png.length > 3000 };
  const bpp = colorType === 6 ? 4 : 3;
  const inflated = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * bpp;
  const prev = Buffer.alloc(stride);
  const cur = Buffer.alloc(stride);
  let pos = 0;
  let first = null;
  let different = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = inflated[pos++];
    const raw = inflated.subarray(pos, pos + stride); pos += stride;
    for (let x = 0; x < stride; x += 1) {
      const left = x >= bpp ? cur[x - bpp] : 0;
      const up = prev[x];
      const upLeft = x >= bpp ? prev[x - bpp] : 0;
      const value = raw[x];
      cur[x] = filter === 0 ? value : filter === 1 ? (value + left) & 255 : filter === 2 ? (value + up) & 255 : filter === 3 ? (value + Math.floor((left + up) / 2)) & 255 : (value + paeth(left, up, upLeft)) & 255;
    }
    for (let px = 0; px < width; px += 8) {
      const base = px * bpp;
      const rgb = [cur[base], cur[base + 1], cur[base + 2]];
      if (!first) first = rgb;
      if (Math.abs(rgb[0] - first[0]) + Math.abs(rgb[1] - first[1]) + Math.abs(rgb[2] - first[2]) > 20) different += 1;
    }
    prev.set(cur);
  }
  return { ok: different > Math.max(80, Math.floor((width * height) / 5000)), width, height };
}

export function buildValidationArtifacts(validation) {
  const payload = {
    product: product.repo,
    result: validation.ok ? 'pass' : 'fail',
    representativeSuite: { requiredScenarioTypes: scenarioIds, scenarioCount: validation.results.length, results: validation.results },
    platformRuntimeGate: product.platformScope,
    generatedArtifacts: ['dist/validation-result.json','dist/web-smoke-result.json', docsZipRel],
    stability: 'no timestamps, host paths, random values, or ZIP byte size are recorded',
    mojibakeHits: scanMojibake()
  };
  writeJson('dist/validation-result.json', payload);
  if (payload.mojibakeHits.length) throw new Error('Mojibake fragments detected: ' + payload.mojibakeHits.join(', '));
  return payload;
}
export async function buildWebSmokeArtifact() {
  const html = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');
  const app = fs.readFileSync(path.join(repoRoot, 'src/web/app.js'), 'utf8');
  const css = fs.readFileSync(path.join(repoRoot, 'src/web/styles.css'), 'utf8');
  const staticChecks = [
    { name: 'nonblank-html', pass: html.length > 300 && html.includes(product.repo) },
    { name: 'app-root', pass: html.includes('id="app"') },
    { name: 'scenario-controls-source', pass: app.includes('happy-path') && app.includes('mixed-batch') },
    { name: 'visual-surface-source', pass: app.includes('canvas') && css.includes('min-height: 100vh') },
    { name: 'primary-operation-source', pass: app.includes('evaluateScenario') && app.includes('renderResult') },
    { name: 'hash-scenario-routing-source', pass: app.includes('window.location.hash') && app.includes('history.replaceState') }
  ];
  const chromePath = findChrome();
  const browserChecks = [];
  let browserStatus = 'chrome-not-found';
  if (chromePath) {
    const server = http.createServer(serveFile);
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-web-smoke-'));
    const userDataDir = path.join(tempDir, 'profile');
    try {
      const port = await listen(server);
      browserStatus = 'completed';
      for (const id of scenarioIds) {
        const shot = path.join(tempDir, `${id}.png`);
        const result = spawnSync(chromePath, ['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--user-data-dir=' + userDataDir,'--window-size=1200,900','--timeout=5000','--virtual-time-budget=2500','--allow-file-access-from-files','--screenshot=' + shot, pathToFileURL(path.join(repoRoot, 'index.html')).href + '#' + id], { encoding: 'utf8', timeout: 20000 });
        const png = fs.existsSync(shot) ? analyzePng(shot) : { ok: false };
        browserChecks.push({ name: `chrome-exit-zero:${id}`, pass: result.status === 0 }, { name: `screenshot-created:${id}`, pass: fs.existsSync(shot) }, { name: `screenshot-nonblank:${id}`, pass: png.ok === true });
        if (result.status !== 0 || png.ok !== true) browserStatus = 'failed';
      }
    } finally {
      await new Promise((resolve) => server.close(resolve));
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
  const checks = [...staticChecks, ...browserChecks];
  const payload = { product: product.repo, method: 'chrome-headless-file-screenshot', browserStatus, result: checks.length > staticChecks.length && checks.every((check) => check.pass) ? 'pass' : 'fail', checks, manualBrowserStatus: 'codex-chrome-smoke-completed; user manual test remains not executed by Codex' };
  writeJson('dist/web-smoke-result.json', payload);
  if (payload.result !== 'pass') throw new Error('Web smoke failed: ' + JSON.stringify(payload, null, 2));
  return payload;
}
function assertGradeScale(q) {
  const invalid = Object.entries(q.grades).filter(([, grade]) => !q.allowedScale.includes(grade));
  if (invalid.length) throw new Error('Invalid QCDS grades: ' + JSON.stringify(invalid));
  const belowAMinus = Object.entries(q.grades).filter(([, grade]) => gradeOrder.indexOf(grade) < gradeOrder.indexOf('A-')).map(([axis]) => axis);
  if (belowAMinus.length) throw new Error('QCDS below A-: ' + belowAMinus.join(', '));
  if (Object.values(q.grades).includes('S+') && q.manualTestStatus === 'manual-test-not-executed-by-codex') throw new Error('S+ is not allowed before user manual test');
}
export function buildQcdsArtifacts(webSmoke) {
  const q = buildQcdsEvaluation();
  assertGradeScale(q);
  if (!webSmoke || webSmoke.result !== 'pass') throw new Error('QCDS requires passing platform runtime gate');
  writeJson('docs/qcds-strict-metrics.json', { product: product.repo, scale: q.allowedScale, qcdsDefinition: q.definition, grades: q.grades, manualTestStatus: q.manualTestStatus, manualTestCapApplied: q.manualTestCapApplied, platformRuntimeGate: { scope: product.platformScope, webSmoke: 'dist/web-smoke-result.json', result: webSmoke.result, method: webSmoke.method }, evidence: { representativeSuite: 'samples/representative-suite.json', validationResult: 'dist/validation-result.json', webSmoke: 'dist/web-smoke-result.json', releaseChecklist: 'docs/release-checklist.md', releaseEvidence: 'docs/release-evidence.json' }, belowAMinus: q.belowAMinus });
  writeJson('docs/qcds-regression-baseline.json', { product: product.repo, baselineVersion: 'v0.1.0-alpha.1', representativeScenarios: scenarioIds, expectedValidationResult: 'pass', expectedWebSmokeResult: 'pass', expectedQcdsMinimum: 'A-', manualTestStatus: 'not-executed', releaseAssetContract: [docsZipRel,'docs/manual-test.md','docs/strict-manual-test-addendum.md'] });
}
export function assertReleaseEvidenceSchema() {
  const evidence = JSON.parse(fs.readFileSync(path.join(repoRoot, 'docs/release-evidence.json'), 'utf8'));
  for (const key of ['product','tag','github','assets','validation']) if (!(key in evidence)) throw new Error('release-evidence missing ' + key);
}
export function buildDocsZip() {
  const missing = docsEntries.filter((entry) => !fs.existsSync(path.join(repoRoot, entry)));
  if (missing.length) throw new Error('Missing docs ZIP entries: ' + missing.join(', '));
  createDeterministicZip(repoRoot, docsEntries, path.join(repoRoot, docsZipRel));
}