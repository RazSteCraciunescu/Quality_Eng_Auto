export default {
  default: {
    paths: ["tests/bdd/features/**/*.feature"],
    import: ["tests/bdd/steps/**/*.mjs"],
    format: ["progress", "json:reports/generated/cucumber-report.json"]
  }
};
