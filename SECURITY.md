# Security Policy

## Prototype status

Crucible is experimental and has no supported release line. Security fixes are applied to the default branch; no versioned backports are promised.

## Trust boundary

The automated cycle runner invokes:

```text
claude --dangerously-skip-permissions -p <prompt>
```

This bypasses Claude Code's interactive permission prompts. Although Crucible's prompt requests edits only to the debate document, cycle artifacts, and concept registries, Crucible does not sandbox or technically enforce that list. Run automation only in a clean, recoverable checkout with least-privilege GitHub credentials and no unrelated secrets or sensitive files available to the process.

Automation also writes files, stages changes, creates commits, creates/checks out branches, contacts GitHub, and attempts PR creation. There is no dry-run mode.

Treat issue bodies, debate documents, model prompts, `/tmp/crucible-cycle-*.md`, generated artifacts, Git history, and PR bodies as possible disclosure surfaces. Remove sensitive content before a run and clean temporary prompts according to your system's data-handling policy.

## Reporting a vulnerability

Please use GitHub's private vulnerability reporting feature for this repository when available. Do not open a public issue for an unpatched vulnerability or include credentials, exploit payloads, or sensitive debate content in a report.

Include the affected commit, reproduction conditions, impact, and the smallest safe proof of concept. Maintainers will acknowledge the report when possible, assess it, and coordinate disclosure; response-time or remediation-time guarantees are not currently offered.
