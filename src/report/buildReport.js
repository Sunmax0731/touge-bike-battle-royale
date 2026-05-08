import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { product } from "../core/product.js";
import { buildQcdsEvaluation } from "../review-model/qcdsModel.js";
import { createDeterministicZip } from "./zip.js";
const repoRoot = path.resolve(path.join(path.dirname(fileURLToPath(import.meta.url)), "../.."));
const docsEntries = ["README.md","AGENTS.md","SKILL.md","docs/requirements.md","docs/specification.md","docs/design.md","docs/implementation-plan.md","docs/test-plan.md","docs/manual-test.md","docs/installation-guide.md","docs/user-guide.md","docs/release-checklist.md","docs/responsibility-map.md","docs/ui-ux-polish.md","docs/post-mvp-roadmap.md","docs/competitive-benchmark.md","docs/evaluation-criteria.md","docs/qcds-evaluation.md","docs/qcds-remote-benchmark.md","docs/qcds-strict-gap-analysis.md","docs/qcds-strict-metrics.json","docs/qcds-regression-baseline.json","docs/security-privacy-checklist.md","docs/traceability-matrix.md","docs/strict-manual-test-addendum.md","docs/source-idea-pack.json","docs/release-evidence.json","docs/releases/v0.1.0-alpha.1.md"];
const mojibakeCodePoints = [0x7e67, 0x90e2, 0x9aeb, 0xfffd];
function writeJson(rel, payload) { const out = path.join(repoRoot, rel); fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, JSON.stringify(payload, null, 2) + "\n", "utf8"); }
function scanMojibake() {
  const fragments = mojibakeCodePoints.map((c) => String.fromCodePoint(c)); const hits = [];
  function walk(rel) { const full = path.join(repoRoot, rel); if (!fs.existsSync(full)) return; const stat = fs.statSync(full); if (stat.isDirectory()) return fs.readdirSync(full).forEach((x) => walk(path.join(rel, x))); if (/\.(md|json|js|html|css|svg)$/.test(rel)) { const txt = fs.readFileSync(full, "utf8"); if (fragments.some((f) => txt.includes(f))) hits.push(rel.replace(/\\/g, "/")); } }
  ["README.md","AGENTS.md","SKILL.md","docs","src","samples","data","index.html"].forEach(walk); return hits;
}
export function buildValidationArtifacts(validation) {
  const payload = { product: product.repo, result: validation.ok ? "pass" : "fail", representativeSuite: { requiredScenarioTypes: ["happy-path","missing-required","warning","mixed-batch"], scenarioCount: validation.results.length, results: validation.results }, generatedArtifacts: ["dist/validation-result.json","dist/web-smoke-result.json","dist/touge-bike-battle-royale-docs.zip"], stability: "no timestamps, host paths, random values, or ZIP byte size are recorded", mojibakeHits: scanMojibake() };
  writeJson("dist/validation-result.json", payload); if (payload.mojibakeHits.length) throw new Error("Mojibake fragments detected: " + payload.mojibakeHits.join(", ")); return payload;
}
export function buildWebSmokeArtifact() {
  const html = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8"); const app = fs.readFileSync(path.join(repoRoot, "src/web/app.js"), "utf8"); const css = fs.readFileSync(path.join(repoRoot, "src/web/styles.css"), "utf8");
  const checks = [
    { name: "nonblank-html", pass: html.length > 300 && html.includes(product.repo) },
    { name: "app-root", pass: html.includes('id="app"') },
    { name: "scenario-controls", pass: app.includes("happy-path") && app.includes("mixed-batch") },
    { name: "visual-surface", pass: app.includes("canvas") && (css.includes("min-height:100vh") || css.includes("min-height: 100vh")) },
    { name: "primary-operation", pass: app.includes("evaluateScenario") && app.includes("renderResult") }
  ];
  const payload = { product: product.repo, method: "static DOM and app-module smoke equivalent for GitHub Pages/local static hosting", result: checks.every((x) => x.pass) ? "pass" : "fail", checks, manualBrowserStatus: "not-executed-by-codex" };
  writeJson("dist/web-smoke-result.json", payload); if (payload.result !== "pass") throw new Error("Web smoke failed"); return payload;
}
export function buildQcdsArtifacts() {
  const q = buildQcdsEvaluation();
  writeJson("docs/qcds-strict-metrics.json", { product: product.repo, scale: ["S+","S-","A+","A-","B+","B-","C+","C-","D+","D-"], qcdsDefinition: q.definition, grades: q.grades, manualTestStatus: q.manualTestStatus, manualTestCapApplied: q.manualTestCapApplied, evidence: { representativeSuite: "samples/representative-suite.json", validationResult: "dist/validation-result.json", webSmoke: "dist/web-smoke-result.json", releaseChecklist: "docs/release-checklist.md", releaseEvidence: "docs/release-evidence.json" }, belowAMinus: q.belowAMinus });
  writeJson("docs/qcds-regression-baseline.json", { product: product.repo, baselineVersion: "v0.1.0-alpha.1", representativeScenarios: ["happy-path","missing-required","warning","mixed-batch"], expectedValidationResult: "pass", expectedWebSmokeResult: "pass", manualTestStatus: "not-executed", releaseAssetContract: ["dist/touge-bike-battle-royale-docs.zip","docs/manual-test.md","docs/strict-manual-test-addendum.md"] });
}
export function assertReleaseEvidenceSchema() { const e = JSON.parse(fs.readFileSync(path.join(repoRoot, "docs/release-evidence.json"), "utf8")); for (const k of ["product","tag","github","assets","validation"]) if (!(k in e)) throw new Error("release-evidence missing " + k); }
export function buildDocsZip() { const missing = docsEntries.filter((x) => !fs.existsSync(path.join(repoRoot, x))); if (missing.length) throw new Error("Missing docs ZIP entries: " + missing.join(", ")); createDeterministicZip(repoRoot, docsEntries, path.join(repoRoot, "dist/touge-bike-battle-royale-docs.zip")); }
