---
document_id: discuss-the-premise-of-freedom-preservin
issue: 12
status: adversarial
created_by: human
crucible_state: adversarial
fossil_export: true
---

# Design Proposal: Freedom-Preserving Software Systems

*Reference: [GNU Free Software Definition](https://www.gnu.org/philosophy/free-sw.en.html)*

Inspired by the GNU Free Software Definition, this proposal defines a system architecture and governance model where user freedom—not platform control—is the primary design constraint.

---

## Premise

**Software should serve its users, not bind them.**

A system is considered "free" when users retain the practical ability to:

- run it for any purpose,
- inspect how it works,
- modify it,
- redistribute it,
- and share improvements with others.

This is a proposal for building systems that preserve those freedoms **operationally, not merely legally**. The distinction matters: legal freedom (permission) without operational freedom (capacity) produces the appearance of liberation while preserving the substance of control.

---

## Theoretical Grounding

### Alternative Framings

The premise "software should serve its users, not bind them" is one framing. Four alternative framings sharpen the proposal's commitments:

- **Instrumentalist framing**: Software is a tool. Tools don't have politics. Freedom is a property of the social arrangements *around* software, not the software itself. On this view, "freedom-preserving software" is a category error — we should be designing freedom-preserving *institutions*.
- **Commons framing**: Software is infrastructure. Infrastructure should be governed as a commons, not owned by individual users or vendors. Freedom here means participatory governance, not individual control. This shifts the locus from user rights to community governance.
- **Capability framing**: Following Sen/Nussbaum's capability approach — a system is free when users have the *real capacity* to exercise their rights, not just formal permission. Capability requires skills, access, documentation, and community support — not just open code.
- **Anti-domination framing**: Freedom means absence of domination by *any* party — vendor, state, or even a community majority. Distinct from absence of constraint; a benevolent gatekeeper still dominates.

### Synthesis

This proposal synthesizes the **capability framing** and the **anti-domination framing** as its operative lenses:

- From capability: freedom requires active investment in lowering the barriers to exercise. Formal permission is necessary but not sufficient. A genuinely free system makes its freedoms *accessible*, not merely *available*.
- From anti-domination: freedom is not just about what users are permitted to do, but about whether any party holds irreversible, asymmetric power over their computational environment. This applies to vendors, states, and even benevolent open-source stewards who centralize de facto authority.

The instrumentalist framing is partially correct: institutional design matters. But software architecture itself shapes what institutions can exist and what users can do. The commons framing is incorporated into the governance model (§ Governance).

---

## Cross-Cutting Framework: Formal vs. Practical Freedom

The central theoretical commitment runs through every principle in this proposal:

**Formal freedom** is legal and technical permission: open license, accessible source, documented APIs.

**Practical freedom** is the exercisable capacity to act on that permission given real-world constraints of skill, time, tooling, documentation, and community support.

A system can maximize formal freedom while destroying practical freedom through:
- architectural complexity that defeats comprehension,
- missing documentation that makes modification guesswork,
- hostile build environments that make reproduction expensive,
- and network effects that make exit costly even when technically possible.

This is the **complexity moat** anti-pattern in its general form: freedom made nominally available but practically inaccessible, through deliberate design or emergent neglect.

**The operative test for this proposal is not "is this permitted?" but "can this actually be done by the users this system serves?"**

---

## Core Design Principles

### 1. User Sovereignty

**The user must remain the ultimate authority over their computational environment.**

This covers execution, data, configuration, automation, and modification. The platform may assist, but must not impose irreversible control.

#### Layered Sovereignty Model

"The user" is not monolithic. In organizational and enterprise contexts, three parties coexist with different sovereignty claims:

| Layer | Party | Primary Domain |
|---|---|---|
| End user | The person using the system | Execution, personal data, UI/UX customization |
| Administrator | The person configuring the deployment | Deployment, access control, system defaults |
| Organization | The entity that owns the deployment | Licensing, data governance, legal compliance |

**Priority rule**: Each layer's sovereignty applies within its domain; no layer may exercise its sovereignty in a way that eliminates a lower layer's rights *within that lower layer's domain*. An organization may not grant itself the right to prevent end users from inspecting or exporting their own data. An administrator may not prevent end users from exporting their own work.

[island: enterprise IT and legal departments — compliance-structural resistance: GDPR, HIPAA, SOC2, and similar regulatory regimes legally *require* organizations to prevent users from exporting data in unauthorized ways, restrict execution environments, and maintain audit trails that override individual user control. The priority rule assumes a liberty-maximizing legal context that does not exist in regulated industries. No enforcement mechanism is proposed to resolve conflicts between this rule and binding legal obligations. In the domains where user data is most sensitive and freedom most consequential, the proposal is in direct conflict with law — and law wins.]

This rule implies that **sovereignty is domain-specific, not strictly hierarchical**. Organizational control over deployment does not extend to end-user control over personal data and outputs. Enterprise deployment does not give organizations unlimited authority over end-user freedoms.

Systems should therefore avoid:
- mandatory cloud dependency,
- opaque decision-making,
- vendor lock-in,
- artificial API restrictions,
- and execution constraints unrelated to security.

#### Tension: Individual Sovereignty vs. Collective Commons

A community's right to govern its shared commons (collective sovereignty) may conflict with an individual's right to fork. Both are legitimate; neither nullifies the other.

**Provisional position**: Individual exit rights take priority over collective stability. Fork fragmentation is a real cost, but the response is investment in commons resilience — governance structures, federated protocols, and network-independent value — not restriction of individual exit. Designing communities to survive fragmentation is preferable to preventing the exit that might cause it.

---

### 2. Inspectability By Default

**All meaningful system behavior should be understandable by the people it affects.**

This implies:
- readable source or declarative configuration,
- observable workflows,
- transparent automation,
- explainable state transitions,
- and durable logs of decisions and actions.

Obfuscation, hidden orchestration, and non-auditable automation are treated as architectural failures, not implementation details.

#### Inspectability in AI Systems

AI systems introduce a specific inspectability challenge: a system may be formally open (weights published, inference code readable) while being practically opaque (causal reasoning in large models is not human-comprehensible at the individual case level).

An AI system satisfies inspectability-by-default when:
1. **Training lineage is auditable**: data sources, filtering decisions, and fine-tuning history are documented and queryable.
2. **Inference paths are traceable**: users can understand what inputs produced what outputs, even if not the internal mechanics.
3. **Decision boundaries are testable**: users can probe the system to understand its behavior in their domain.
4. **Uncertainty is surfaced**: the system communicates confidence levels and known failure modes.

[dead end: all four criteria as stated depend on vendor self-attestation with no independent verification mechanism. "Auditable training lineage" means the vendor documents what they claim to have used — there is no mechanism for external verification of that claim. "Traceable inference paths" at the level described reduces to post-hoc explanation, which this document already identifies as an insufficient substitute for genuine inspectability. Criteria 1–4 can be satisfied in full by a compliance document that discloses nothing actionable. Without third-party audit rights and standardized disclosure formats, this section specifies the appearance of transparency, not transparency itself.]

[island: AI model vendors — IP and copyright liability resistance: genuine disclosure of training data lineage exposes vendors to copyright infringement claims and trade secret liability at scale. This is not a coordination failure or bad faith — it is a structural legal incentive that makes real compliance with criterion 1 commercially untenable. The vendors most likely to deploy consequential AI systems are the vendors with the most legal exposure from disclosing training data provenance. The criteria that would make AI systems most genuinely inspectable are precisely the criteria those vendors cannot meet without assuming prohibitive legal risk.]

An AI system does **not** satisfy inspectability by providing post-hoc explanations that are statistically accurate but incorrect for any given case — a known failure mode of saliency-based explanation methods.

---

### 3. Modifiability As A First-Class Capability

**Users must be able to adapt systems to their own needs.**

This applies the formal/practical framework directly: a system is genuinely modifiable when users can *actually modify it*, not merely when they are legally permitted to.

The architecture should therefore favor:
- modular components,
- declarative interfaces,
- portable data formats,
- replaceable subsystems,
- and local extensibility.

**Testable criterion**: A freedom-preserving system should be modifiable by a competent practitioner working alone with publicly available documentation. If modification requires insider knowledge, undocumented toolchains, or coordination with the original authors, the system fails this test regardless of its license.

[dead end: criterion collapses for large complex systems — Linux kernel, Android AOSP, any production-scale AI system. No individual practitioner working alone can fork and independently operate these systems. The criterion provides meaningful guidance only for small projects where freedom-preserving design is already easiest. It produces no guidance for the systems where practical freedom is hardest to secure and where this proposal's principles are most consequential. A test that is only applicable where it is least needed is not a test.]

#### Positive Architectural Obligations

A genuinely freedom-preserving system has positive obligations beyond mere permission:
- **Progressive disclosure**: simple operations remain simple; complex operations are possible without requiring full internals knowledge.
- **Documentation sufficient for modification**: users should not need author access to modify the system.
- **Stable, versioned interfaces**: modifications should be durable across releases, not broken by internal refactors.
- **Test infrastructure**: users should be able to verify that their modifications work correctly.

These obligations apply to the system's builders — they are not optional enhancements but requirements for the system to be genuinely free under the capability framing.

[island: volunteer-maintained and under-resourced projects — unfunded-obligation resistance: progressive disclosure, stable versioned interfaces, comprehensive documentation, and test infrastructure are expensive to produce and maintain continuously. Imposing these as hard requirements on communities of unpaid volunteers or under-resourced startups without a funding model does not produce freedom-preserving outcomes — it produces non-compliant projects that lose to well-funded alternatives that can absorb the cost. A framework that structurally favors well-resourced actors may concentrate the very power it was designed to check.]

---

### 4. Right To Fork

**Communities must be able to continue a system independently of its original creator.**

This requires:
- portable infrastructure,
- reproducible environments,
- documented protocols,
- exportable data,
- and governance structures that do not centralize irreversible authority.

Forkability is treated as resilience infrastructure — the sustained ability to continue without the original vendor is the ultimate test of a community's freedom.

**Fork fragmentation is a real and underappreciated cost.** In network-dependent systems, fragmentation can destroy the commons that made the system valuable. A federated protocol where 90% of users concentrate on one instance creates *de facto* centralization with *de jure* freedom. The right to fork is necessary but not sufficient for resilience.

**Architectural implication**: Freedom-preserving systems should design their core value to be protocol-level, not concentration-level. A federated system whose value lives in the protocol survives fragmentation; one whose value lives in the dominant instance's network does not. This is a design requirement, not merely a governance aspiration.

---

### 5. Shared Improvement Loop

**Improvements should compound socially.**

The system should encourage:
- contribution,
- redistribution,
- remixing,
- peer review,
- and publication of derived work.

Knowledge generated inside the system should be recoverable and reusable by others.

**Dependency on practical freedom**: The shared improvement loop functions only if modifiability is first-class. Formal permission to remix is insufficient if the complexity moat prevents contributors from understanding what they are remixing. Investment in the improvement loop requires prior investment in lowering the activation energy of contribution.

---

## Architectural Implications

### Preferred System Characteristics

- Local-first where possible
- Plain-text or open formats
- Git-compatible workflows
- Deterministic interfaces
- Human-readable configuration
- Composable tools over monoliths
- Protocols over proprietary integrations
- Exportability at every layer

### Anti-Patterns

**Core anti-patterns** (direct violations of the five principles above):
- Hidden AI orchestration
- Non-exportable memory systems
- SaaS-only execution
- Locked deployment targets
- Remote kill switches
- License restrictions on modification
- Obfuscated source
- **Tivoization**: hardware using free software but preventing user-modified versions via firmware verification

**Ecosystem anti-patterns** (freedom-reducing at the system or community level, even when individual components appear free):
- **Cloudization**: Hardware runs locally, meaningful computation runs remotely. Passes a "local-first" audit technically while violating its spirit. Cloud-era mutation of tivoization.
- **Network capture**: Technically free code on a platform where network effects make alternatives impractical. The system is free; the ecosystem isn't.
- **Training data extraction**: Free-to-use systems that harvest user behavior or content to train proprietary models, extracting cognitive labor without reciprocation or user consent.
- **Permissive-to-proprietary pipeline**: Permissive licenses that enable large actors to absorb free systems into proprietary products without reciprocation. Legal but freedom-reducing at the ecosystem level.
- **Complexity moat**: Open-source code made practically unmodifiable through deliberate or emergent architectural complexity, missing documentation, or hostile build environments.
- **API capture**: Services that expose open APIs but centralize meaningful computation, making the API a dependency rather than an interface to replaceable infrastructure.
- **Composability paradox** [speculative]: Composable tools that create emergent opacity and lock-in when their composition becomes complex enough to be practically opaque — freedom at the component level, lock-in at the system level.

---

## Governance Model

A freedom-preserving governance model distinguishes:
- stewardship from ownership,
- coordination from control,
- and guidance from restriction.

**Minimal governance structure**:

1. **Standards as commons, not property**: Protocol and interface standards should be governed by multi-stakeholder bodies, not controlled by any single implementor. No single party should hold a veto over protocol evolution. [island: well-resourced corporate actors — governance-capture via funding dominance: W3C is dominated by browser vendors, IETF processes are steered by companies that fund full-time participant engineers, ITU is captured by nation-states with aligned industrial interests. Multi-stakeholder governance displaces the capture problem rather than solving it — governance structure and power balance are orthogonal properties. Parties with the most resources to participate in standards bodies tend to be the parties with the strongest interest in steering standards toward their existing implementations. "Multi-stakeholder" is a procedural property, not a power-balance guarantee.]
2. **Exit rights as governance floor**: Any participant — individual or community — must retain the right to exit and continue independently. Governance structures that make exit impractical (by centralizing data, by making protocols undocumented, by concentrating infrastructure authority) are anti-patterns regardless of the governance body's intentions.
3. **Transparent governance**: Governance decisions, conflicts of interest, and funding sources should be auditable by participants. Governance opacity is an inspectability failure.
4. **Separation of stewardship and profit**: Entities that profit from the system should not be the sole stewards of the protocol or commons infrastructure it depends on.

Contributors may guide standards, but users retain the right to adapt, fork, and redistribute the system.

Community continuity is prioritized over institutional permanence.

---

## Success Criteria

A freedom-preserving system succeeds when:
- users can leave without losing capability,
- communities can continue without the original vendor,
- workflows remain inspectable by the people they affect,
- improvements remain shareable and compoundable,
- and no single party holds irreversible authority over the system or its users.

**Testable criteria**:
- A competent practitioner can fork and independently operate the system using only public documentation.
- A user can export all data they have generated in a portable, documented format.
- A user can audit what the system did and why in any given interaction.
- The system continues to function if the original vendor ceases operations.
- A first-time contributor can make a meaningful modification without contacting the original authors.

The goal is not merely open access to code.

The goal is **durable computational self-determination** — the sustained capacity of individuals and communities to direct their own computational environments, independent of any vendor, platform, or institutional intermediary.

---

## Unresolved Tensions

The following tensions are partially addressed in the principles above. Provisional positions are given where the evidence supports them; genuinely open questions remain open.

**1. Freedom vs. Security**
Secure enclaves, TPMs, and verified boot chains restrict user modification to defend against malicious software. The proposal identifies tivoization as an anti-pattern but needs a principled boundary.

*Provisional position*: A restriction is legitimate when it protects the user from external threats; it is illegitimate when it protects the vendor's control from the user. The distinguishing test: who does the restriction primarily protect — the user from threats, or the vendor from the user? Verified boot chains that protect against rootkits are legitimate; firmware locks that prevent loading user-modified software are tivoization regardless of the security framing used to justify them.

[dead end: the distinguishing test is not operationalizable from outside the restriction. The same firmware lock simultaneously protects against rootkits (legitimate user protection) and prevents user-modified software (vendor control). These two effects are architecturally inseparable: a boot chain that permits user-modified software provides an attacker vector for unsigned code. Vendors can always assert a security justification — and often be correct simultaneously — while the user has no inspection mechanism to challenge the claim without the access the restriction prevents. The test requires the user to have already exercised the freedom they are being asked to prove they need.]

**2. Formal Freedom vs. Practical Freedom**
Addressed as the cross-cutting framework. *Provisional position*: practical freedom is the operative standard; formal freedom is necessary but not sufficient. Systems that only provide formal freedom are non-compliant with this proposal's intent.

**3. Individual Sovereignty vs. Collective Commons**
Addressed under User Sovereignty §1. *Provisional position*: individual exit rights take priority; collective resilience is a design responsibility, not a constraint on exit.

**4. Freedom vs. Economic Sustainability**
*Unresolved — and the highest-severity structural failure mode in this proposal.* Freedom-preserving systems often struggle economically because they cannot extract monopoly rents from lock-in. Candidate models: public subsidy (as with roads and public standards bodies), commons governance with shared infrastructure funding, hybrid dual-licensing (which risks the permissive-to-proprietary anti-pattern). No model has proven reliably sustainable at scale without compromise.

[dead end: the historical pattern here is not ambiguous — it is consistent. Red Hat was acquired by IBM. MySQL was absorbed into Oracle. Elasticsearch changed its license under commercial pressure. HashiCorp changed its license. Android AOSP became a vehicle for Google Play Services lock-in. The permissive-to-proprietary pipeline is not an edge case; it is the modal outcome for successful freedom-preserving projects under current market conditions. "Explicit governance investment" is named without identifying who provides it, in what form, or by what mechanism that investment is protected from capture by the same actors who benefit from the current regime. This is not a reason to abandon the proposal's goals — but treating it as one tension among many understates its severity. Every other principle in this document is downstream of whether the project survives economically. Economic capture is the extinction event; all other failure modes are contingent on it not occurring first.]

**5. Positive vs. Negative Freedom**
Addressed under Modifiability §3. *Provisional position*: system builders have positive architectural obligations to enable the exercise of freedoms, not just negative obligations to refrain from restricting them. This is an intentional extension beyond the GNU definition's negative-liberty register.

**6. AI Systems and Freedom**
Partially addressed under Inspectability §2. The deeper question — whether consequential AI decisions are ever meaningfully inspectable in the relevant sense — remains open. A user who can audit training lineage and test decision boundaries is in a meaningfully better position than one who cannot. But a probabilistic model trained on shared corpora exercises a form of influence that is not fully decomposable into inspectable parts. *Provisional position*: freedom-preserving AI systems must be auditable (lineage and training decisions documented), testable (behavior probeable by users), and interruptible (users can override, reject, or exit AI-driven workflows without losing capability). Full mechanistic transparency may not be achievable; auditability, testability, and interruptibility are achievable and are the operative standard.

---

## Failure Modes

The following failure modes represent the highest-risk paths by which a sincere implementation of this proposal produces freedom-reducing outcomes despite correct intent. Each reflects a documented pattern in existing systems.

### 1. Economic Gravity (Highest Severity)
Freedom-preserving systems that achieve adoption become acquisition targets or license-change candidates. The permissive-to-proprietary pipeline is the modal outcome for successful free software projects under current market conditions. No governance structure proposed here has resisted it at scale.

**Mechanism**: Success → adoption → commercial value → acquisition or license change → the freedoms users built on no longer exist. Every other principle in this document is downstream of whether the project survives economically.

### 2. Compliance-Sovereignty Conflict
In regulated industries (healthcare, finance, government), binding legal obligations require organizations to restrict user freedoms as defined here — to prevent unauthorized data export, to enforce audit controls that override individual user preferences, to restrict execution environments. The layered sovereignty model's priority rule assumes a liberty-maximizing legal context that does not exist in these domains.

**Mechanism**: The proposal applies in unregulated contexts, ceding the domains where user data is most sensitive and freedom most consequential.

### 3. Governance Capture
Multi-stakeholder governance bodies are dominated by the actors with the most resources to participate, which are typically the actors with the strongest interest in steering standards toward their existing implementations. Governance structure and power balance are orthogonal properties.

**Mechanism**: Well-funded actors fund full-time standards participants, dominate agenda-setting, and achieve de facto veto power while maintaining procedural multi-stakeholder legitimacy.

### 4. Self-Attestation Without Verification (AI Systems)
The AI-inspectability criteria are structurally dependent on vendor self-reporting. There is no mechanism by which an outside party can verify training lineage, inference traceability, or surfaced uncertainty without vendor cooperation. Criteria that depend entirely on self-attestation are compliance theater at scale.

**Mechanism**: Vendors publish lineage documents that satisfy the formal criterion; the documents are unverifiable from outside; meaningful disclosure does not occur.

### 5. Unfunded Obligations
Positive architectural obligations — progressive disclosure, stable interfaces, documentation, test infrastructure — are expensive to maintain continuously. Imposing them as hard requirements on under-resourced projects selects for well-funded alternatives that can absorb the cost, potentially concentrating the power the framework was designed to check.

**Mechanism**: Compliance cost selects for well-resourced actors; the framework validates the actors it was intended to constrain.

### 6. Security as Cover
The freedom/security boundary proposed here ("who does the restriction primarily protect?") is not operationalizable from outside the restriction. The same technical mechanism simultaneously protects users from attackers and protects vendors from users. Vendors can assert security justification; users have no verification path that does not depend on the access the restriction prevents.

**Mechanism**: Tivoization-class restrictions are reframed as security measures; the proposal has no mechanism to distinguish the cases externally.

---

## Decision Record

| Date | Decision | Rationale |
|---|---|---|
| 2026-05-24 | Synthesize capability + anti-domination framings as the proposal's theoretical basis | These framings are more action-guiding than instrumentalist or pure commons framings; they imply concrete architectural obligations |
| 2026-05-24 | Adopt layered sovereignty model with domain-specificity rule | Resolves the "who is the user" ambiguity without privileging organizational or administrative control over end-user rights within end-user domains |
| 2026-05-24 | Promote formal/practical freedom distinction to document-wide framework | The formal/practical gap is the central mechanism through which freedom-reducing systems evade critique; elevating it to framework level gives it structural force across all principles |
| 2026-05-24 | Establish positive architectural obligations as first-class commitment | Extends the proposal beyond the GNU negative-liberty register to require active enablement, not just permission |
| 2026-05-24 | Provide provisional positions on five of six tensions | Steelman pass should commit where evidence supports; only genuine open questions remain open |
| 2026-05-24 | Articulate AI-inspectability criteria | Hidden AI orchestration is named as an anti-pattern without criteria for what makes AI orchestration non-hidden; auditability + testability + interruptibility are the operative standard |
| 2026-05-24 | Adversarial pass: annotate failure modes and resistant populations | Six structural failure modes identified; four dead ends flagged inline; three island populations flagged; Failure Modes section added; economic sustainability elevated to highest-severity unresolved tension |
