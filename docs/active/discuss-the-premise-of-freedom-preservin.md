---
document_id: discuss-the-premise-of-freedom-preservin
issue: 12
status: seed
created_by: human
crucible_state: seed
fossil_export: true
---

# Discuss the Premise of Freedom-Preserving Software Systems

starting with https://www.gnu.org/philosophy/free-sw.en.html

Here's the doc: 
---
Design Proposal: Freedom-Preserving Software Systems

Inspired by the GNU Free Software Definition, this proposal defines a system architecture and governance model where user freedom—not platform control—is the primary design constraint.  ￼

Premise

Software should serve its users, not bind them.

A system is considered “free” when users retain the practical ability to:

* run it for any purpose,
* inspect how it works,
* modify it,
* redistribute it,
* and share improvements with others.  ￼

This is a proposal for building systems that preserve those freedoms operationally, not merely legally.

⸻

## Alternative Framings of the Premise [strawman]

The premise "software should serve its users, not bind them" is one framing. Alternatives worth considering before committing to the architecture:

- **Instrumentalist framing**: Software is a tool. Tools don't have politics. Freedom is a property of the social arrangements *around* software, not the software itself. On this view, "freedom-preserving software" is a category error — we should be designing freedom-preserving *institutions*.
- **Commons framing**: Software is infrastructure. Infrastructure should be governed as a commons, not owned by individual users or vendors. Freedom here means participatory governance, not individual control. This shifts the locus from user rights to community governance.
- **Capability framing** [speculative]: Following Sen/Nussbaum's capability approach — a system is free when users have the *real capacity* to exercise their rights, not just formal permission. Capability requires skills, access, documentation, and community support — not just open code.
- **Anti-domination framing**: Freedom means absence of domination by *any* party — vendor, state, or even a community majority. Distinct from absence of constraint; a benevolent gatekeeper still dominates.

These framings are not mutually exclusive, but they imply different architectural priorities. The current proposal leans instrumentalist-to-capability; the commons and anti-domination framings are underdeveloped.

⸻

Core Design Principles

1. User Sovereignty

The user must remain the ultimate authority over:

* execution,
* data,
* configuration,
* automation,
* and modification.

The platform may assist, but must not impose irreversible control.

Systems should avoid:

* mandatory cloud dependency,
* opaque decision-making,
* vendor lock-in,
* artificial API restrictions,
* or execution constraints unrelated to security.

**Concept split [strawman]:** "User Sovereignty" conflates two distinct and sometimes conflicting ideas:

- **Individual sovereignty**: One user's right to control their own instance, data, and configuration.
- **Collective sovereignty**: A community's right to govern the shared commons — the protocols, defaults, and infrastructure that make individual sovereignty meaningful.

These can conflict: an individual's right to fork might fragment a community commons that others depend on. The current proposal prioritizes individual sovereignty without resolving this tension.

**Open question [strawman]:** *Who is "the user"?* In organizational or enterprise software, three parties coexist with different sovereignty claims: the purchasing organization, the IT administrator, and the end user. The proposal treats "user" as monolithic. Which party's sovereignty governs when they conflict?

⸻

2. Inspectability By Default

All meaningful system behavior should be understandable.

This implies:

* readable source or declarative configuration,
* observable workflows,
* transparent automation,
* explainable state transitions,
* and durable logs of decisions and actions.

Obfuscation, hidden orchestration, and non-auditable automation are treated as architectural failures, not implementation details.

⸻

3. Modifiability As A First-Class Capability

Users must be able to adapt systems to their own needs.

The architecture should therefore favor:

* modular components,
* declarative interfaces,
* portable data formats,
* replaceable subsystems,
* and local extensibility.

A system that technically exposes source code but practically prevents modification violates the spirit of freedom.  ￼

**Concept split [strawman]:** Modifiability exists on two levels that should be distinguished:

- **Formal freedom**: Legal and technical permission to modify — open license, accessible source.
- **Practical freedom**: The actual capacity to modify given the user's resources, skills, available time, and the system's architecture.

A system can maximize formal freedom while minimizing practical freedom via: architectural complexity, missing documentation, hostile build environments, or toolchain opacity. The **complexity moat** anti-pattern names this: open-source code made practically unmodifiable through deliberate or emergent architectural complexity.

[speculative] A genuinely freedom-preserving system may have obligations beyond permission: documentation, simplified interfaces, progressive disclosure of internals, and community structures that lower the activation energy for modification.

⸻

4. Right To Fork

Communities must be able to continue a system independently of its original creator.

This requires:

* portable infrastructure,
* reproducible environments,
* documented protocols,
* exportable data,
* and governance structures that do not centralize irreversible authority.

Forkability is treated as resilience infrastructure.

**Tension [strawman]:** The right to fork carries an underexplored cost: **fork fragmentation**. In network-dependent systems, fragmentation can destroy the commons that made the system valuable. A federated protocol where the right to run your own instance is protected but 90% of users concentrate on one instance creates *de facto* centralization with *de jure* freedom. The right to fork may be necessary but not sufficient for genuine resilience.

⸻

5. Shared Improvement Loop

Improvements should compound socially.

The system should encourage:

* contribution,
* redistribution,
* remixing,
* peer review,
* and publication of derived work.

Knowledge generated inside the system should be recoverable and reusable by others.

⸻

Architectural Implications

Preferred System Characteristics

* Local-first where possible
* Plain-text or open formats
* Git-compatible workflows
* Deterministic interfaces
* Human-readable configuration
* Composable tools over monoliths
* Protocols over proprietary integrations
* Exportability at every layer

⸻

Anti-Patterns

The following are considered freedom-reducing patterns:

* Hidden AI orchestration
* Non-exportable memory systems
* SaaS-only execution
* Locked deployment targets
* Remote kill switches
* License restrictions on modification
* Obfuscated source
* “Secure” systems that reject user modifications (“tivoization”)

**Additional anti-patterns [strawman]:**

* **Cloudization** [speculative]: Hardware runs locally, meaningful computation runs remotely. Passes a “local-first” audit technically while violating its spirit. A cloud-era mutation of tivoization.
* **Network capture**: Technically free code on a platform where network effects make alternatives impractical. The system is free; the ecosystem isn't.
* **Training data extraction**: Free-to-use systems that harvest user behavior or content to train proprietary models, extracting cognitive labor without reciprocation or user consent.
* **Permissive-to-proprietary pipeline**: Permissive licenses that enable large actors to absorb free systems into proprietary products without reciprocation. Legal but freedom-reducing at the ecosystem level.
* **Complexity moat**: Open source code made practically unmodifiable through deliberate or emergent architectural complexity, missing documentation, or hostile build environments.
* **API capture**: Services that expose open APIs but centralize meaningful computation, making the API a dependency rather than an interface to replaceable infrastructure.
* **Composability paradox** [speculative]: Composable tools that create emergent opacity and lock-in when their composition becomes complex enough to be practically opaque — freedom at the component level, lock-in at the system level.

⸻

Governance Model

The project should distinguish:

* stewardship from ownership,
* coordination from control,
* and guidance from restriction.

Contributors may guide standards, but users retain the right to adapt, fork, and redistribute the system.

Community continuity is prioritized over institutional permanence.

⸻

Success Criteria

A freedom-preserving system succeeds when:

* users can leave without losing capability,
* communities can continue without the original vendor,
* workflows remain inspectable,
* and improvements remain shareable.

The goal is not merely open access to code.

The goal is durable computational self-determination.

⸻

## Open Tensions [strawman]

The following tensions are unresolved in the current proposal. They are surfaced here for the next pass rather than collapsed prematurely.

**1. Freedom vs. Security**
Secure enclaves, TPMs, and verified boot chains restrict user modification to defend against malicious software. The document flags "tivoization" but doesn't define where legitimate security constraints end. A principled answer is needed.

**2. Formal Freedom vs. Practical Freedom**
Formal permission to modify/fork/inspect is necessary but not sufficient. Practical freedom requires skills, tooling, documentation, and accessible community structures. Does this proposal have obligations beyond permitting? Is the goal to enable *all* users or technically capable ones?

**3. Individual Sovereignty vs. Collective Commons**
The right to fork can fragment communities that depend on network effects. Individual exit rights and collective infrastructure sustainability can conflict. Which takes priority, and under what conditions?

**4. Freedom vs. Economic Sustainability**
Freedom-preserving systems often struggle economically. The proposal doesn't address what governance or economic models sustain them. [speculative: freedom-preserving systems may require public subsidy, commons governance analogous to public infrastructure, or hybrid models not yet well-defined]

**5. Negative Freedom vs. Positive Freedom** [speculative]
The GNU definition operates primarily in the *negative liberty* register: freedom *from* restriction. But positive freedom — the capacity to actually accomplish things — may require active investment in tooling, documentation, and support. Is there an obligation on system builders to enable positive freedom, not just remove barriers?

**6. AI Systems and Freedom**
The proposal lists "hidden AI orchestration" as an anti-pattern. But it doesn't address deeper questions: What does user sovereignty mean when consequential decisions are made by probabilistic models trained on data the user didn't contribute? Can "freedom-preserving" and "AI-powered" coexist without contradiction? Is an explainable AI system with opaque weights inspectable in the relevant sense?

⸻

## Questions for Steelman Pass [strawman]

- Is "durable computational self-determination" a coherent goal when AI systems are trained on shared corpora and run on shared infrastructure?
- Does forkability-as-resilience assume a level of community technical capacity that may not exist for most user populations?
- Should the proposal distinguish between *freedoms that must be protected absolutely* vs. *freedoms that can be traded off* — and if so, how?
- Is there a positive obligation on system builders, not just prohibitions on what they must not do?
- How does data sovereignty relate to code freedom? Are they the same right, or different ones requiring different protections?

## Decision Record

| Date | Decision | Rationale |
|---|---|---|
| TBD | TBD | TBD |
