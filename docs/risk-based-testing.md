# Risk-based testing and release gate

## Score

The score is the sum of bounded contributions:

```text
failed tests      min((100 - passRate) * 1.8, 50)
critical defects  min(criticalDefects * 22, 44)
high defects      min(highDefects * 6, 24)
flakiness         min(flakyRate * 1.2, 12)
coverage gap      min(max(85 - coverage, 0) * 0.7, 15)
escaped defects   min(escapedDefects * 5, 15)
```

The combined result is capped at 100 and rounded to one decimal place. Contributions are bounded so one noisy signal cannot grow without limit, while explicit gate rules still protect hard release blockers.

## Decision rules

**Blocked** when any of the following is true:

- at least one open critical defect;
- pass rate below 80%;
- score 70 or higher.

**Conditional** when the release is not blocked and any of the following is true:

- at least one open high-severity defect;
- pass rate below 95%;
- coverage below 85%;
- score 25 or higher.

Otherwise the release is **ready**.

## Why hard rules and a score

A weighted score is useful for ranking and trend review. It should not make a severe defect disappear inside an average. A single open critical defect therefore blocks the release even when every other metric is strong.

## Example outcomes

| Release | Main evidence | Score | Gate |
|---|---|---:|---|
| Cirrus | 72.6% pass, one critical, two high, 5.1% flaky | 94.3 | Blocked |
| Aurora | 99.0% pass, no critical/high defects, 91.4% coverage | 5.4 | Ready |
| Borealis | 91.5% pass, two high defects, 78.3% coverage | 37.4 | Conditional |

The thresholds are a policy example, not a universal industry standard. A real team should calibrate them against escaped defects, incident severity and product risk.
