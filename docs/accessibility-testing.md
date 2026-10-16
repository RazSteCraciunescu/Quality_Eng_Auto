# Accessibility testing

Automated checks are useful guardrails, not a complete accessibility review.

## Automated

- Playwright + axe: WCAG 2 A/AA and 2.1 AA rules, failing serious or critical findings.
- Lighthouse: accessibility score budget of 1.0 for the small local page.
- Browser tests use accessible roles and labels rather than CSS-only selectors where practical.

## Manual checklist

- Reach every interactive element with keyboard only.
- Confirm visible focus and logical focus order.
- Open and close release details without losing context.
- Check status is communicated by text, not color alone.
- Verify 200% zoom and a 320-pixel viewport without lost content.
- Confirm search result counts and refresh feedback are announced.
- Review headings, table headers and link purpose with a screen reader.
- Test reduced-motion preference and high-contrast mode.

The dashboard avoids custom widget reimplementations where native controls are sufficient.
