PYTHON ?= python3
MODE ?= strawman
DOC ?= docs/active/design-doc.md
CYCLE ?= 001
ROUNDS ?= 3
ISSUE ?=

# ── Automated debate flow ────────────────────────────────────────────────────

# Start a new debate from a GitHub issue.
# Usage: make new-debate ISSUE=<url-or-number>
new-debate:
	$(PYTHON) scripts/new_debate.py --issue $(ISSUE)

# Run one agent pass (one cycle). Invokes Claude with the role file as context.
# Usage: make run-cycle CYCLE=001 MODE=strawman DOC=docs/active/foo.md
run-cycle:
	$(PYTHON) scripts/run_cycle.py --cycle $(CYCLE) --mode $(MODE) --doc $(DOC)

# Run a full N-round debate (strawman→steelman→adversarial × ROUNDS).
# Builds observatory.json and opens a PR when done.
# Usage: make run-debate DOC=docs/active/foo.md ROUNDS=3
run-debate:
	$(PYTHON) scripts/run_debate.py --doc $(DOC) --rounds $(ROUNDS)

# ── Manual / legacy steps ────────────────────────────────────────────────────

init:
	$(PYTHON) scripts/init_registry.py

new-cycle:
	$(PYTHON) scripts/new_cycle.py --cycle $(CYCLE) --mode $(MODE) --doc $(DOC)

extract-concepts:
	$(PYTHON) scripts/extract_concepts.py --cycle $(CYCLE) --mode $(MODE) --doc $(DOC)

pr-body:
	$(PYTHON) scripts/generate_pr_summary.py --cycle $(CYCLE) --mode $(MODE)

idea-health:
	$(PYTHON) scripts/compute_idea_health.py

export-graph:
	$(PYTHON) scripts/build_graph.py

build-observatory:
	$(PYTHON) scripts/build_observatory.py --doc $(DOC) --out visualizations/observatory.json
