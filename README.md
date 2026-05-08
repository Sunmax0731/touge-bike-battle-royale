# 峠バイク・バトルロイヤル

touge-bike-battle-royale は、NON PICKUP 優先リスト Rank 70 / Game No.10 から昇格した closed alpha プロダクトです。最大100人が峠を上る、または下るスマホ向けバイクバトルロイヤルのWeb検証版。

## Quick Start

```powershell
cd D:\AI\Game\touge-bike-battle-royale
npm test
npm run cli
```

## Closed Alpha Scope

- 公開想定: Google Play / BOOTH
- 対象ユーザー: 峠バイク対戦の操作感と脱落ルールを早期検証したいプレイヤーと開発者
- 手動テスト: Codex側では未実施。手順は `docs/manual-test.md` と `docs/strict-manual-test-addendum.md` に記載

## Architecture

- `src/core`: プロダクト定義と代表シナリオ評価
- `src/validators`: representative suite と期待結果の検証
- `src/report`: validation result、web smoke、QCDS metrics、deterministic docs ZIP の生成
- `src/review-model`: QCDS 評価モデル
- `src/cli`: CLI 検証入口
- `src/web`: 静的Web表示と主要操作
- `src/game`: game loop と balancing の境界

## Release Artifacts

- `dist/touge-bike-battle-royale-docs.zip`
- `dist/validation-result.json`
- `dist/web-smoke-result.json`
- `docs/release-evidence.json`
