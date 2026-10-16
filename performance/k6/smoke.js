import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 3,
  duration: "20s",
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<250"],
    checks: ["rate>0.99"]
  }
};

const baseUrl = __ENV.BASE_URL || "http://127.0.0.1:4173";

export default function () {
  const response = http.get(`${baseUrl}/api/releases?sort=riskScore&direction=desc`);
  check(response, {
    "status is 200": (result) => result.status === 200,
    "returns three releases": (result) => result.json("meta.count") === 3,
    "highest risk is Cirrus": (result) => result.json("data.0.name") === "Cirrus"
  });
  sleep(0.25);
}
