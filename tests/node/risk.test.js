import test from "node:test";
import assert from "node:assert/strict";
import { calculateRisk } from "../../dist/risk.js";

const cases = [
  {
    name: "blocks Cirrus because critical risk remains",
    metrics: { passRate: 72.6, coverage: 78, flakyRate: 5.1, criticalDefects: 1, highDefects: 2, escapedDefects: 0 },
    status: "blocked",
    score: 94.3
  },
  {
    name: "passes Aurora through the release gate",
    metrics: { passRate: 99, coverage: 91.4, flakyRate: 3, criticalDefects: 0, highDefects: 0, escapedDefects: 0 },
    status: "ready",
    score: 5.4
  },
  {
    name: "keeps Borealis conditional until high defects are resolved",
    metrics: { passRate: 91.5, coverage: 78.3, flakyRate: 4.5, criticalDefects: 0, highDefects: 2, escapedDefects: 0 },
    status: "conditional",
    score: 37.4
  }
];

for (const scenario of cases) {
  test(scenario.name, () => {
    const result = calculateRisk(scenario.metrics);
    assert.equal(result.status, scenario.status);
    assert.equal(result.score, scenario.score);
    assert.ok(result.reasons.length > 0);
  });
}

test("clamps extreme values and never returns a negative contribution", () => {
  const result = calculateRisk({ passRate: 100, coverage: 100, flakyRate: 0, criticalDefects: 0, highDefects: 0, escapedDefects: 0 });
  assert.equal(result.score, 0);
  assert.equal(result.status, "ready");
  assert.ok(Object.values(result.contributions).every((value) => value >= 0));
});

test("caps the combined risk score at 100", () => {
  const result = calculateRisk({ passRate: 0, coverage: 0, flakyRate: 100, criticalDefects: 10, highDefects: 10, escapedDefects: 10 });
  assert.equal(result.score, 100);
  assert.equal(result.status, "blocked");
});
