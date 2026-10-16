import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const spec = JSON.parse(readFileSync(resolve(root, "api/openapi.json"), "utf8"));

test("OpenAPI contract exposes unique operation IDs", () => {
  const operationIds = [];
  for (const pathItem of Object.values(spec.paths)) {
    for (const operation of Object.values(pathItem)) {
      if (operation && typeof operation === "object" && operation.operationId) operationIds.push(operation.operationId);
    }
  }
  assert.equal(new Set(operationIds).size, operationIds.length);
  assert.ok(operationIds.length >= 7);
});

test("every path declares at least one response", () => {
  for (const [path, pathItem] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(pathItem)) {
      assert.ok(operation.responses, `${method.toUpperCase()} ${path} has no responses`);
    }
  }
});

test("release schema keeps the gate fields required", () => {
  const required = new Set(spec.components.schemas.Release.required);
  for (const field of ["riskScore", "status", "gateReasons", "metrics"]) assert.ok(required.has(field));
});
