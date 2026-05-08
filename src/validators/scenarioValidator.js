import { evaluateScenario } from '../core/product.js';
export function validateRepresentativeSuite(suite) {
  const ids = (suite.scenarios || []).map((scenario) => scenario.id);
  const missingTypes = ['happy-path','missing-required','warning','mixed-batch'].filter((id) => !ids.includes(id));
  const results = (suite.scenarios || []).map((scenario) => ({ scenario, actual: evaluateScenario(scenario) }));
  const mismatches = results.filter(({ scenario, actual }) => scenario.expected.status !== actual.status || scenario.expected.accepted !== actual.accepted || scenario.expected.warnings !== actual.warnings).map(({ scenario, actual }) => ({ id: scenario.id, expected: scenario.expected, actual }));
  return { ok: missingTypes.length === 0 && mismatches.length === 0, missingTypes, mismatches, results: results.map(({ scenario, actual }) => ({ id: scenario.id, type: scenario.type, status: actual.status, accepted: actual.accepted, warnings: actual.warnings, score: actual.score })) };
}
