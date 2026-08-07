# Contributing to Crucible

Crucible is an early prototype. Contributions should improve the existing debate engine, documentation, schemas, and viewer without implying stability or capabilities the repository does not have.

## Before changing anything

1. Read the README trust boundary and side-effect matrix.
2. Start from a clean checkout: `git status --short` must be empty.
3. Create a focused branch; do not run debate automation on `main`.
4. Keep unrelated credentials, repositories, and files outside the checkout before invoking Claude with bypassed permission prompts.

## Change guidelines

- Inspect the implementation before documenting behavior.
- Keep generated outputs distinguishable from hand-authored inputs.
- Preserve useful experimental viewer work, but label non-canonical variants clearly.
- Do not claim Fossil integration without an executable integration and validation evidence.
- Do not describe the viewer as dependency-free: it loads runtime dependencies from CDNs.
- Do not claim a dry-run or non-mutating workflow until one is implemented and tested.
- Never commit secrets, tokens, private issue content, or model transcripts containing sensitive material.

## Validation

Run the checks that match GitHub Actions:

```bash
python3 scripts/validate_registry.py
python3 scripts/build_graph.py
python3 scripts/compute_idea_health.py
git diff --check
```

For documentation or viewer changes, also:

```bash
python3 -m http.server 7890 --directory visualizations
```

Open `http://localhost:7890/observatory-ui/` and confirm both generated-data and missing-JSON fallback behavior. The fallback must show a visible **MOCK DATA** label. Check documentation links and command paths from a clean checkout.

The graph and health scripts rewrite derived files. Review `git status --short` afterward and include generated changes only when they are intentional.

## Pull requests

Keep one concern per PR. Explain user impact, side effects, and validation. Documentation that changes operational guidance should name every external invocation, filesystem mutation, Git action, and GitHub action involved.
