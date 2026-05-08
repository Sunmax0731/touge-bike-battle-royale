export const product = {
  "repo": "touge-bike-battle-royale",
  "domain": "Game",
  "rank": 70,
  "tier": "P3",
  "score": 48,
  "ideaNo": 10,
  "ideaName": "峠バイク・バトルロイヤル",
  "field": "バイク対戦ゲーム",
  "publicTarget": "Google Play / BOOTH",
  "platformScope": "static Web gameplay prototype; Android/Unity は post-MVP",
  "overview": "大人数3D対戦の本実装前に、峠ライン、Bot集団、脱落判定をブラウザで確認する閉鎖アルファ検証版。",
  "problem": "3D、大人数、スマホ対戦は範囲が大きく、まずは操作感と脱落ルールを小さく固定する必要がある。",
  "differentiation": "スマホ/3D化の前に、Bot混在のライン取りと脱落判定を静的Webで再現し、手動テストへ渡せる。",
  "audience": "バイク対戦ゲームの試作者、レースゲーム好き、モバイル展開前の検証者",
  "requiredInputs": [
    "bikeClass",
    "riderInput",
    "trackSegment",
    "matchState"
  ],
  "modules": [
    "game-loop",
    "bot-balancer",
    "web-game",
    "scenario-validator"
  ],
  "accent": "#ef4444",
  "secondary": "#111827",
  "scenarioNouns": [
    "峠ライン",
    "Bot集団",
    "脱落判定"
  ]
};

export function evaluateScenario(scenario) {
  if (scenario.type === 'mixed-batch') {
    const results = (scenario.items || []).map((inputs, index) => evaluateScenario({ id: scenario.id + '-' + index, inputs, flags: index === 2 ? ['needsReview'] : [] }));
    const accepted = results.filter((result) => result.status !== 'error').length;
    const warnings = results.filter((result) => result.status !== 'pass').length;
    return { id: scenario.id, status: warnings ? 'warning' : 'pass', accepted, warnings, missing: results.flatMap((result) => result.missing), score: warnings ? 78 : 96 };
  }
  const inputs = scenario.inputs || {};
  const missing = product.requiredInputs.filter((key) => inputs[key] === undefined || inputs[key] === null || inputs[key] === '');
  if (missing.length) return { id: scenario.id, status: 'error', accepted: 0, warnings: 0, missing, score: 0 };
  const risky = Object.values(inputs).some((value) => /stale|low|noisy|manual-lock|large-water-change|late-brake|unknown|overflow|rush|storm|fatigue|unstable|crowded|high/i.test(String(value)));
  const warnings = (scenario.flags || []).includes('needsReview') || risky ? 1 : 0;
  return { id: scenario.id, status: warnings ? 'warning' : 'pass', accepted: 1, warnings, missing: [], score: warnings ? 86 : 96 };
}

export function summarizeProduct() {
  return { name: product.ideaName, repo: product.repo, domain: product.domain, releaseTarget: product.publicTarget, platformScope: product.platformScope, responsibilities: product.modules, requiredInputs: product.requiredInputs };
}
