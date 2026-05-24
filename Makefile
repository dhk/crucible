PYTHON ?= python3
MODE ?= strawman
DOC ?= docs/active/design-doc.md
CYCLE ?= 001

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
