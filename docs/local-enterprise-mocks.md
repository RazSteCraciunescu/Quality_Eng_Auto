# Local enterprise-tool samples

The repository does not require access to a company Jira, Confluence, QMetry, TestRail or Jenkins instance. Instead, it stores small neutral artifacts in formats that can be reviewed or imported.

## Files

- Jira: five issue-shaped JSON records with links and acceptance criteria.
- Confluence: one Markdown export representing five governance records.
- QMetry: ten CSV test cases plus a JUnit execution result.
- TestRail: eight CSV cases with multiline steps.
- Jenkins: one build record with stages and archived artifacts.

## Connection boundary

A production adapter should live outside the risk model and return the same normalized concepts:

```text
release -> requirements -> tests -> executions -> defects -> evidence links
```

Adapters need pagination, authentication, rate-limit handling, retry policy, schema-drift checks, redaction and an audit trail. None of those concerns are hidden behind fake successful network calls here.
