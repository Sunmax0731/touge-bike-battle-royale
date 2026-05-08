export function balanceScore(result) { if (result.status === "error") return 0; if (result.status === "warning") return 70 + result.accepted * 5; return 95; }
