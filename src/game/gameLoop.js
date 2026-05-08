import { evaluateScenario } from "../core/product.js";
export function stepGameState(state, action) { const next = { ...state, turns: (state.turns || 0) + 1, lastAction: action }; next.momentum = Math.max(0, Math.min(100, (state.momentum || 50) + (action === "risk" ? 12 : 4))); return next; }
export function evaluateGameScenario(scenario) { return evaluateScenario(scenario); }
