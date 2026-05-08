import { evaluateScenario } from '../core/product.js';
export function runGameTurn(turnInput) { const result = evaluateScenario({ id: 'game-turn', inputs: turnInput }); return { ...result, frame: result.status === 'pass' ? 'advance' : result.status === 'warning' ? 'caution' : 'blocked' }; }
