# QCDS厳格ギャップ分析

## 発覚した齟齬

- 以前のQCDSは docs とZIPの存在に寄り、対象プラットフォームでの起動確認が弱かった。
- gradeに定義外の `A` が混入しても失敗しなかった。
- created_idea由来の文字化けを正式成果物へ残す余地があった。

## 対応

- Chrome headless smoke を `npm test` に組み込み、platform runtime gate をQCDSの前提にした。
- QCDS grade を10段階スケールで機械検証する。
- 文字化け検査を主要ファイルへ拡大した。

## A-未満の観点

現時点ではありません。手動テストは未実施のため、SatisfactionはA-に抑えています。
