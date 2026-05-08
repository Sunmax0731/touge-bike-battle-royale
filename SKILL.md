# SKILL

峠バイク・バトルロイヤル の実装・検証スキルです。

## Start Order

1. `docs/source-idea-pack.json` で Rank、source ZIP、metadata 一致を確認する。
2. `docs/requirements.md`、`docs/specification.md`、`docs/design.md` を読む。
3. `src/game` と `index.html` のゲームループ/表示境界を確認する。
4. `npm test` を実行し、再実行後に Git 差分が出ないことを確認する。
5. prerelease 後は `docs/release-evidence.json` を更新し、docs ZIP と release assets を再同期する。
