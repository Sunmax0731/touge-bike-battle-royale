# 設計

対象: 峠バイク・バトルロイヤル (Rank 70, Game No.10)

## 3 Options

1. CLIのみ: 実装は軽いが公開前確認が弱い。
2. 静的Webのみ: 表示は強いが自動検証とtraceabilityが弱い。
3. CLI + static Web + stable artifacts: 自動検証、操作UI、release assetsを同じ責務分割で扱える。

## Criteria

検証容易性、手動テスト粒度、公開導線、MVP後の拡張性で比較します。

## Chosen Option

Option 3 を採用します。責務は game-loop / balancer / web-game / scenario-validator を中心に分割します。
