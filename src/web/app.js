import { product, evaluateScenario } from "../core/product.js";
const scenarios = {
  "happy-path": {
    "id": "happy-path",
    "type": "happy-path",
    "title": "峠ラインの通常処理",
    "inputs": {
      "bikeClass": "light",
      "riderInput": "lean-left",
      "trackSegment": "hairpin-03",
      "matchState": "safe-pack"
    },
    "expected": {
      "status": "pass",
      "accepted": 1,
      "warnings": 0
    }
  },
  "missing-required": {
    "id": "missing-required",
    "type": "missing-required",
    "title": "trackSegment不足時の停止",
    "inputs": {
      "bikeClass": "light",
      "riderInput": "lean-left",
      "trackSegment": "",
      "matchState": "safe-pack"
    },
    "expected": {
      "status": "error",
      "accepted": 0,
      "warnings": 0
    }
  },
  "warning": {
    "id": "warning",
    "type": "warning",
    "title": "Bot集団の注意喚起",
    "inputs": {
      "bikeClass": "heavy",
      "riderInput": "late-brake",
      "trackSegment": "wet-hairpin",
      "matchState": "near-elimination"
    },
    "flags": [
      "needsReview"
    ],
    "expected": {
      "status": "warning",
      "accepted": 1,
      "warnings": 1
    }
  },
  "mixed-batch": {
    "id": "mixed-batch",
    "type": "mixed-batch",
    "title": "脱落判定を含む混在バッチ",
    "items": [
      {
        "bikeClass": "light",
        "riderInput": "lean-left",
        "trackSegment": "hairpin-03",
        "matchState": "safe-pack"
      },
      {
        "bikeClass": "light",
        "riderInput": "lean-left",
        "trackSegment": "",
        "matchState": "safe-pack"
      },
      {
        "bikeClass": "heavy",
        "riderInput": "late-brake",
        "trackSegment": "wet-hairpin",
        "matchState": "near-elimination"
      }
    ],
    "expected": {
      "status": "warning",
      "accepted": 2,
      "warnings": 2
    }
  }
};
const app = document.getElementById("app"); const state = { selected: "happy-path" };
function draw(canvas, result) { const ctx = canvas.getContext("2d"); const w = canvas.width, h = canvas.height; const g = ctx.createLinearGradient(0,0,w,h); g.addColorStop(0, product.accent); g.addColorStop(1, product.secondary); ctx.fillStyle = g; ctx.fillRect(0,0,w,h); ctx.globalAlpha = .18; for (let i=0;i<8;i+=1){ ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(80+i*85, 90+((i*37)%180), 32+(i%3)*14, 0, Math.PI*2); ctx.fill(); } ctx.globalAlpha=1; ctx.fillStyle="rgba(255,255,255,.9)"; ctx.strokeStyle="rgba(17,24,39,.34)"; ctx.lineWidth=2; for (let i=0;i<4;i+=1){ const x=80+i*150, y=210-i*22; ctx.beginPath(); ctx.roundRect(x,y,104,72,12); ctx.fill(); ctx.stroke(); } ctx.fillStyle = result.status === "error" ? "#991b1b" : result.status === "warning" ? "#92400e" : "#064e3b"; ctx.font = "700 28px system-ui"; ctx.fillText(result.status.toUpperCase(), 38, 52); ctx.font = "600 18px system-ui"; ctx.fillText(product.scenarioNouns.join(" / "), 38, h - 34); }
function buttons() { return Object.values(scenarios).map((s) => '<button class="scenario-button' + (state.selected === s.id ? ' is-active' : '') + '" data-scenario="' + s.id + '">' + s.title + '</button>').join(""); }
function renderResult(r) { return '<dl class="result-grid"><div><dt>Status</dt><dd>' + r.status + '</dd></div><div><dt>Accepted</dt><dd>' + r.accepted + '</dd></div><div><dt>Warnings</dt><dd>' + r.warnings + '</dd></div><div><dt>Score</dt><dd>' + r.score + '</dd></div></dl>'; }
function render() { const s = scenarios[state.selected]; const r = evaluateScenario(s); app.innerHTML = '<header class="app-header"><div><p class="meta">Rank ' + product.rank + ' / ' + product.domain + '</p><h1>' + product.ideaName + '</h1><p class="lead">' + product.overview + '</p></div><a class="header-link" href="./docs/user-guide.md">User guide</a></header><main class="workspace"><section class="left-panel"><h2>Representative scenarios</h2><div class="scenario-list">' + buttons() + '</div><div class="input-card"><h3>' + s.title + '</h3><pre>' + JSON.stringify(s.inputs || s.items, null, 2) + '</pre></div></section><section class="stage"><canvas id="preview" width="720" height="360" aria-label="' + product.ideaName + ' preview canvas"></canvas>' + renderResult(r) + '</section><aside class="right-panel"><h2>Release readiness</h2><ul><li>自動検証: representative suite</li><li>手動テスト: 未実施</li><li>公開先: ' + product.publicTarget + '</li><li>責務: ' + product.modules.join(" / ") + '</li></ul></aside></main>'; document.querySelectorAll("[data-scenario]").forEach((b) => b.addEventListener("click", () => { state.selected = b.dataset.scenario; render(); })); draw(document.getElementById("preview"), r); }
render();
