import test from "node:test";
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { ReleaseRepository } from "../../dist/repository.js";

const repository = new ReleaseRepository(resolve(import.meta.dirname, "../.."));

test("loads and evaluates all release fixtures", () => {
  assert.equal(repository.releases.length, 3);
  assert.deepEqual(repository.summary(), { total: 3, ready: 1, conditional: 1, blocked: 1 });
});

test("filters by status and performs case-insensitive search", () => {
  assert.deepEqual(repository.list({ status: "ready" }).map((item) => item.name), ["Aurora"]);
  assert.deepEqual(repository.list({ q: "ORDERS CORE" }).map((item) => item.name), ["Borealis"]);
});

test("sorts numeric risk scores descending", () => {
  assert.deepEqual(
    repository.list({ sort: "riskScore", direction: "desc" }).map((item) => item.name),
    ["Cirrus", "Borealis", "Aurora"]
  );
});
