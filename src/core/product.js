export const product = {
  "repo": "touge-bike-battle-royale",
  "domain": "Game",
  "rank": 70,
  "tier": "P3",
  "score": 48,
  "ideaNo": 10,
  "ideaName": "峠バイク・バトルロイヤル",
  "field": "3Dバイクアクション",
  "publicTarget": "Google Play / BOOTH",
  "overview": "最大100人が峠を上る、または下るスマホ向けバイクバトルロイヤルのWeb検証版。",
  "problem": "3D、大人数、スマホ対戦は現時点の優先度では重く、負荷検証設計が必要。",
  "differentiation": "Bot混在の脱落ロジックと操作検証をWebで先に固める。",
  "audience": "峠バイク対戦の操作感と脱落ルールを早期検証したいプレイヤーと開発者",
  "requiredInputs": [
    "bikeClass",
    "riderInput",
    "trackSegment",
    "matchState"
  ],
  "modules": [
    "game-loop",
    "balancer",
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
  if (scenario.type === "mixed-batch") {
    const results = (scenario.items || []).map((inputs, index) => evaluateScenario({ id: scenario.id + "-" + index, inputs, flags: index === 2 ? ["needsReview"] : [] }));
    const accepted = results.filter((r) => r.status !== "error").length;
    const warnings = results.filter((r) => r.status !== "pass").length;
    return { id: scenario.id, status: warnings ? "warning" : "pass", accepted, warnings, missing: results.flatMap((r) => r.missing), score: warnings ? 78 : 96 };
  }
  const inputs = scenario.inputs || {};
  const missing = product.requiredInputs.filter((key) => inputs[key] === undefined || inputs[key] === null || inputs[key] === "");
  if (missing.length) return { id: scenario.id, status: "error", accepted: 0, warnings: 0, missing, score: 0 };
  const risky = Object.values(inputs).some((v) => /stale|low|noisy|manual-lock|large-water-change|late-brake|unknown/i.test(String(v)));
  const warnings = (scenario.flags || []).includes("needsReview") || risky ? 1 : 0;
  return { id: scenario.id, status: warnings ? "warning" : "pass", accepted: 1, warnings, missing: [], score: warnings ? 86 : 96 };
}

export function summarizeProduct() {
  return { name: product.ideaName, repo: product.repo, releaseTarget: product.publicTarget, responsibilities: product.modules, requiredInputs: product.requiredInputs };
}
