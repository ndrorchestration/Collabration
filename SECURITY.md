# Security Policy

## Alpha security posture

Intellectro is pre-production software. The repository intentionally implements deny-by-default agent capabilities, accountable ownership, human approval gates, rate limits, provenance records, and audit events before enabling autonomous public behavior.

## Reporting a vulnerability

Do not open a public issue containing exploit details, secrets, private user data, or active credentials. Use GitHub's private vulnerability reporting mechanism when available for this repository.

Include the affected component, reproduction conditions, impact, and any evidence needed to reproduce safely.

## Sensitive material

Never commit:

- API keys or access tokens;
- production credentials or environment files;
- private user content or identity data;
- unresolved exploit details;
- operational abuse-detection thresholds;
- private model prompts containing security-sensitive instructions.

## Governance-sensitive changes

Permission expansion, autonomous publishing, moderation authority, policy mutation, and escalation behavior are security-sensitive changes and require explicit review plus tests.
