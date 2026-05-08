const grades = { Quality: 'S-', Cost: 'A+', Delivery: 'A+', Satisfaction: 'A-' };
const allowedScale = ["S+","S-","A+","A-","B+","B-","C+","C-","D+","D-"];

export function buildQcdsEvaluation() {
  return {
    definition: {
      Quality: '代表シナリオ、自動検証、platform runtime gate、security/privacy、release evidence を含む品質。',
      Cost: '追加依存を抑え、Node.js とローカルChromeで検証できる運用コスト。',
      Delivery: 'closed alpha に必要な docs、ZIP、GitHub prerelease、再実行性の到達度。',
      Satisfaction: '利用者が導入、操作、手動テスト、次の改善判断へ迷わず進める満足度。'
    },
    grades,
    allowedScale,
    manualTestStatus: 'manual-test-not-executed-by-codex',
    manualTestCapApplied: true,
    belowAMinus: []
  };
}
