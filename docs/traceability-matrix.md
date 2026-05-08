# Traceability Matrix

| 要件 | 実装 | テスト | 証跡 |
| --- | --- | --- | --- |
| 代表シナリオ4種 | `samples/representative-suite.json` | `tests/representative-suite.test.js` | `dist/validation-result.json` |
| platform runtime gate | `src/web/app.js` / `src/report/buildReport.js` | `npm test` | `dist/web-smoke-result.json` |
| QCDS 10段階 | `src/review-model/qcdsModel.js` | `npm test` | `docs/qcds-strict-metrics.json` |
| release docs ZIP | `src/report/zip.js` | `npm test` | `dist/touge-bike-battle-royale-docs.zip` |
