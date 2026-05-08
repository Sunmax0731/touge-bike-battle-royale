# 設計

スマホ/3D化の前に、Bot混在のライン取りと脱落判定を静的Webで再現し、手動テストへ渡せる。

UIは左に代表シナリオ、中央にcanvasと結果、右にrelease readinessを配置します。Chrome headless smokeで `data-smoke=ready`、ボタン、結果パネル、platform scope を確認します。
