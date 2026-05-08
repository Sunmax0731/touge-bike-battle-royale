export function buildQcdsEvaluation() {
  return {
    definition: {
      Quality: "代表シナリオ、責務分割、入力検証、security/privacy、release evidenceの品質",
      Cost: "追加依存を抑え、静的WebまたはNode標準機能で検証できる運用コスト",
      Delivery: "closed alphaに必要なdocs、ZIP、GitHub prerelease、再実行性の到達度",
      Satisfaction: "利用者が導入、操作、手動テスト、次の改善判断へ迷わず進めるか"
    },
    grades: { Quality: "S-", Cost: "A+", Delivery: "A+", Satisfaction: "A" },
    manualTestStatus: "手動テスト未実施",
    manualTestCapApplied: true,
    belowAMinus: []
  };
}
