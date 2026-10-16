import http from "k6/http";
import { check } from "k6";

export const options = {
  scenarios: {
    browse_releases: {
      executor: "ramping-arrival-rate",
      startRate: 5,
      timeUnit: "1s",
      preAllocatedVUs: 20,
      maxVUs: 80,
      stages: [
        { target: 20, duration: "30s" },
        { target: 40, duration: "1m" },
        { target: 5, duration: "20s" }
      ]
    }
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(90)<180", "p(99)<500"]
  }
};

const baseUrl = __ENV.BASE_URL || "http://127.0.0.1:4173";

export default function () {
  const releaseId = ["aurora-480", "borealis-500rc2", "cirrus-231"][__ITER % 3];
  const responses = http.batch([
    ["GET", `${baseUrl}/api/releases?status=all`],
    ["GET", `${baseUrl}/api/releases/${releaseId}`],
    ["GET", `${baseUrl}/api/integrations`]
  ]);
  check(responses[0], { "release list succeeds": (response) => response.status === 200 });
  check(responses[1], { "release detail succeeds": (response) => response.status === 200 });
  check(responses[2], { "integration list succeeds": (response) => response.status === 200 });
}
