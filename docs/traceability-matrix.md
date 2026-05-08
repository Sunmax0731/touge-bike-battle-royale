# Traceability Matrix

対象: 峠バイク・バトルロイヤル (Rank 70, Game No.10)

| 要求 | 実装 | 検証 | docs |
| 必須入力検証 | src/core/product.js | tests/representative-suite.test.js | docs/specification.md |
| 代表シナリオ | samples/representative-suite.json | dist/validation-result.json | docs/test-plan.md |
| Web非blank/操作 | index.html, src/web/app.js | dist/web-smoke-result.json | docs/manual-test.md |
| QCDS | src/review-model/qcdsModel.js | docs/qcds-strict-metrics.json | docs/qcds-evaluation.md |
| Release evidence | docs/release-evidence.json | GitHub API確認 | docs/releases/v0.1.0-alpha.1.md |
