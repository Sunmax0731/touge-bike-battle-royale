# 責務分割

対象: 峠バイク・バトルロイヤル (Rank 70, Game No.10)

| 領域 | 責務 |
| src/core | プロダクト定義と代表シナリオ評価 |
| src/validators | suite構造と期待結果の検証 |
| src/report | stable JSON、QCDS、docs ZIP生成 |
| src/review-model | QCDS定義と採点 |
| src/cli | CLI実行入口 |
| src/web | 静的Web表示と主要操作 |
| src/game | 静的Webまたはローカルサーバーで確認できる browser game として、非blank表示、主要要素、主要操作を検証します。 |
