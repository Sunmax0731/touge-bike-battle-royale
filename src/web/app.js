import { product, evaluateScenario } from '../core/product.js';
const scenarios = {
  "happy-path": {
    "id": "happy-path",
    "type": "happy-path",
    "title": "峠バイク・バトルロイヤルの通常フロー",
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
    "title": "bikeClass不足時の停止",
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
    "title": "脱落寸前の警告",
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
    "title": "正常・不足・警告を含む混在バッチ",
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
const app = document.getElementById('app');
const initialScenario = scenarios[window.location.hash.slice(1)] ? window.location.hash.slice(1) : 'happy-path';
const state = { selected: initialScenario };
function draw(canvas, result) {
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, product.accent);
  gradient.addColorStop(1, product.secondary);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 0.18;
  for (let index = 0; index < 9; index += 1) {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(80 + index * 76, 90 + ((index * 41) % 190), 24 + (index % 3) * 12, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = 'rgba(255,255,255,0.72)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(42, 260);
  ctx.bezierCurveTo(180, 140, 320, 330, 470, 190);
  ctx.bezierCurveTo(560, 100, 630, 150, 690, 92);
  ctx.stroke();
  ctx.fillStyle = result.status === 'error' ? '#fee2e2' : result.status === 'warning' ? '#fef3c7' : '#dcfce7';
  ctx.fillRect(36, 28, 230, 62);
  ctx.fillStyle = result.status === 'error' ? '#991b1b' : result.status === 'warning' ? '#92400e' : '#166534';
  ctx.font = '700 28px system-ui';
  ctx.fillText(result.status.toUpperCase(), 56, 68);
  ctx.fillStyle = '#ffffff';
  ctx.font = '600 18px system-ui';
  ctx.fillText(product.scenarioNouns.join(' / '), 38, canvas.height - 34);
}
function scenarioButtons() {
  return Object.values(scenarios).map((scenario) => '<button class="scenario-button' + (state.selected === scenario.id ? ' is-active' : '') + '" data-scenario="' + scenario.id + '">' + scenario.title + '</button>').join('');
}
function renderResult(result) {
  return '<dl class="result-grid" data-result-status="' + result.status + '"><div><dt>Status</dt><dd>' + result.status + '</dd></div><div><dt>Accepted</dt><dd>' + result.accepted + '</dd></div><div><dt>Warnings</dt><dd>' + result.warnings + '</dd></div><div><dt>Score</dt><dd>' + result.score + '</dd></div></dl>';
}
function render() {
  const scenario = scenarios[state.selected];
  const result = evaluateScenario(scenario);
  app.innerHTML = '<header class="app-header" data-smoke="ready"><div><p class="meta">Rank ' + product.rank + ' / ' + product.domain + '</p><h1>' + product.ideaName + '</h1><p class="lead">' + product.overview + '</p><p class="platform">' + product.platformScope + '</p></div><a class="header-link" href="./docs/user-guide.md">User guide</a></header><main class="workspace"><section class="left-panel"><h2>Representative scenarios</h2><div class="scenario-list">' + scenarioButtons() + '</div><div class="input-card"><h3>' + scenario.title + '</h3><pre>' + JSON.stringify(scenario.inputs || scenario.items, null, 2) + '</pre></div></section><section class="stage"><canvas id="preview" width="720" height="360" aria-label="' + product.ideaName + ' preview canvas"></canvas>' + renderResult(result) + '</section><aside class="right-panel"><h2>Release readiness</h2><ul><li>自動検証: representative suite</li><li>ブラウザ確認: Chrome headless smoke</li><li>手動テスト: Codex側では未実施</li><li>公開先: ' + product.publicTarget + '</li><li>責務: ' + product.modules.join(' / ') + '</li></ul></aside></main>';
  document.querySelectorAll('[data-scenario]').forEach((button) => button.addEventListener('click', () => { state.selected = button.dataset.scenario; history.replaceState(null, '', '#' + state.selected); render(); }));
  draw(document.getElementById('preview'), result);
}
render();
