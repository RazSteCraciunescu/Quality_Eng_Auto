Feature: Risk-based release gate
  The delivery team needs a consistent release decision based on visible quality evidence.

  Scenario Outline: Determine the gate from release metrics
    Given a release has a pass rate of <passRate> percent
    And it has <critical> critical and <high> high severity open defects
    And coverage is <coverage> percent with a flaky rate of <flaky> percent
    When the release gate is evaluated
    Then the result should be <status>
    And the risk score should be <score>

    Examples:
      | passRate | critical | high | coverage | flaky | status      | score |
      | 99.0     | 0        | 0    | 91.4     | 3.0   | ready       | 5.4   |
      | 91.5     | 0        | 2    | 78.3     | 4.5   | conditional | 37.4  |
      | 72.6     | 1        | 2    | 78.0     | 5.1   | blocked     | 94.3  |
