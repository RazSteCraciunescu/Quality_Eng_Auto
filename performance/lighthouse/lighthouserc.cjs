module.exports = {
  ci: {
    collect: {
      startServerCommand: "node dist/server.js",
      startServerReadyPattern: "listening on",
      url: ["http://127.0.0.1:4173/"],
      numberOfRuns: 3,
      settings: {
        chromeFlags: "--headless --no-sandbox",
        preset: "desktop"
      }
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 1 }],
        "categories:best-practices": ["error", { minScore: 0.95 }],
        "categories:seo": ["warn", { minScore: 0.9 }],
        "first-contentful-paint": ["warn", { maxNumericValue: 1500 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.05 }]
      }
    },
    upload: { target: "filesystem", outputDir: "reports/generated/lighthouse" }
  }
};
