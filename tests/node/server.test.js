import test from "node:test";
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { startServer } from "../../dist/server.js";

let running;

test.before(async () => {
  running = await startServer({ projectRoot: resolve(import.meta.dirname, "../.."), port: 0 });
});

test.after(async () => {
  await running.close();
});

test("health endpoint returns service metadata and security headers", async () => {
  const response = await fetch(`${running.baseUrl}/api/health`);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.status, "ok");
  assert.equal(body.service, "release-readiness-lab");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.ok(response.headers.get("x-request-id"));
});

test("release endpoint filters blocked releases", async () => {
  const response = await fetch(`${running.baseUrl}/api/releases?status=blocked`);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.meta.count, 1);
  assert.equal(body.data[0].name, "Cirrus");
  assert.equal(body.data[0].riskScore, 94.3);
});

test("release evaluation rejects invalid metric ranges", async () => {
  const response = await fetch(`${running.baseUrl}/api/releases/aurora-480/evaluate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ metrics: { passRate: 140, coverage: 91, flakyRate: 1, criticalDefects: 0, highDefects: 0, escapedDefects: 0 } })
  });
  const body = await response.json();
  assert.equal(response.status, 422);
  assert.equal(body.error, "invalid_metrics");
});


test("list endpoint rejects unsupported filters instead of returning misleading empty data", async () => {
  const invalidStatus = await fetch(`${running.baseUrl}/api/releases?status=almost-ready`);
  assert.equal(invalidStatus.status, 400);
  assert.equal((await invalidStatus.json()).error, "invalid_status");

  const longQuery = await fetch(`${running.baseUrl}/api/releases?q=${"x".repeat(101)}`);
  assert.equal(longQuery.status, 400);
  assert.equal((await longQuery.json()).error, "query_too_long");
});

test("release evaluation rejects fractional defect counts", async () => {
  const response = await fetch(`${running.baseUrl}/api/releases/aurora-480/evaluate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ metrics: { passRate: 99, coverage: 91, flakyRate: 1, criticalDefects: 0.5, highDefects: 0, escapedDefects: 0 } })
  });
  assert.equal(response.status, 422);
  assert.equal((await response.json()).error, "invalid_metrics");
});


test("metrics endpoint exposes bounded release gauges", async () => {
  const response = await fetch(`${running.baseUrl}/metrics`);
  const body = await response.text();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /text\/plain/);
  assert.match(body, /release_readiness_releases\{status="ready"\} 1/);
  assert.match(body, /release_readiness_releases\{status="conditional"\} 1/);
  assert.match(body, /release_readiness_releases\{status="blocked"\} 1/);
  assert.match(body, /release_readiness_release_average_risk 45\.7/);
});

test("SOAP sample returns XML for a known release", async () => {
  const response = await fetch(`${running.baseUrl}/soap/release-readiness`, {
    method: "POST",
    headers: { "content-type": "application/xml" },
    body: "<releaseReadinessRequest><releaseId>aurora-480</releaseId></releaseReadinessRequest>"
  });
  const body = await response.text();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /application\/xml/);
  assert.match(body, /<status>ready<\/status>/);
  assert.match(body, /<riskScore>5\.4<\/riskScore>/);
});

test("unknown routes return a structured 404 response", async () => {
  const response = await fetch(`${running.baseUrl}/api/does-not-exist`);
  const body = await response.json();
  assert.equal(response.status, 404);
  assert.equal(body.error, "not_found");
  assert.ok(body.requestId);
});
