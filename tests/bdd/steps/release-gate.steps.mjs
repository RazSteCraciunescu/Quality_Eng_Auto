import assert from "node:assert/strict";
import { Given, Then, When } from "@cucumber/cucumber";
import { calculateRisk } from "../../../dist/risk.js";

Given("a release has a pass rate of {float} percent", function (passRate) {
  this.metrics = { passRate, coverage: 100, flakyRate: 0, criticalDefects: 0, highDefects: 0, escapedDefects: 0 };
});

Given("it has {int} critical and {int} high severity open defects", function (critical, high) {
  this.metrics.criticalDefects = critical;
  this.metrics.highDefects = high;
});

Given("coverage is {float} percent with a flaky rate of {float} percent", function (coverage, flaky) {
  this.metrics.coverage = coverage;
  this.metrics.flakyRate = flaky;
});

When("the release gate is evaluated", function () {
  this.result = calculateRisk(this.metrics);
});

Then("the result should be {word}", function (status) {
  assert.equal(this.result.status, status);
});

Then("the risk score should be {float}", function (score) {
  assert.equal(this.result.score, score);
});
