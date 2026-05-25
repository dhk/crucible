---
document_id: discuss-the-premise-of-freedom-preservin
issue: 12
status: steelman
created_by: human
crucible_state: steelman
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

The premise "software should serve its users, not bind them" is one framing. Seven alternative framings sharpen the proposal's commitments:

- **Instrumentalist framing**: Software is a tool. Tools don't have politics. Freedom is a property of the social arrangements *around* software, not the software itself. On this view, "freedom-preserving software" is a category error — we should be designing freedom-preserving *institutions*.
- **Commons framing**: Software is infrastructure. Infrastructure should be governed as a commons, not owned by individual users or vendors. Freedom here means participatory governance, not individual control. This shifts the locus from user rights to community governance.
- **Capability framing**: Following Sen/Nussbaum's capability approach — a system is free when users have the *real capacity* to exercise their rights, not just formal permission. Capability requires skills, access, documentation, and community support — not just open code.
- **Anti-domination framing**: Freedom means absence of domination by *any* party — vendor, state, or even a community majority. Distinct from absence of constraint; a benevolent gatekeeper still dominates.
- **Temporal framing**: Freedom is not a property of a system at a point in time but of its *trajectory*. A system that is free today but structurally trending toward lock-in — through accumulating dependencies, eroding documentation, concentrating governance, or expanding network effects — is not a free system in any meaningful sense. On this framing, freedom-preservation is an ongoing maintenance activity, not a design-time achievement. A system can be certified as free at release and become unfree within two years without any deliberate decision by any actor. This framing implies that freedom assessments must be periodic and dynamic, not one-time. See §Freedom Decay and Periodic Assessment for the concrete mechanism this implies.
- **Exit-option framing** [speculative]: Freedom is not the active exercise of rights but the *credible availability* of exit. On this view, a system is free when leaving is genuinely possible — even if most users never leave. The mere existence of a viable exit option disciplines platform behavior; the *threat* of exit constrains extraction. This framing is structurally distinct from the capability framing: a user need not have the skills to fork or inspect in order to benefit from exit-option freedom, as long as *someone* can exit and alternatives exist. The design target is maintaining exit credibility at the ecosystem level, not guaranteeing individual capacity at the user level. This framing implies a different success criterion: not "can every user exit?" but "does the exit option remain credible enough to constrain platform behavior?" The [exit ecosystem] concept (§Right To Fork) operationalizes this framing architecturally.
- **Active-governance framing** [speculative]: Freedom is not individual rights or individual capacity but *collective shaping power* — the ability of affected communities to meaningfully influence the direction of systems that govern them. On this view, inspection and modification are instrumental: they matter because they enable participation in governance, not because they are valuable in themselves. A system with open source code but no governance participation channel is less free under this framing than a system with a robust governance mechanism even if the underlying code is proprietary. The active-governance framing implies an underexplored design requirement: systems should have legible governance pathways, not just legible source. The user-cooperative model (§Governance Model) is the institutional form this framing implies.

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

#### Voluntary Delegation: A Distinct Mechanism

The proposal's sovereignty model treats freedom loss primarily as coercive — imposed by vendors, platforms, or organizations against user interests. But a significant category is **voluntary delegation**: users who actively choose to surrender freedoms in exchange for convenience, reliability, or social participation.

App stores, managed cloud services, algorithm-curated feeds, and SaaS platforms frequently offer terms that would, under this proposal's framework, constitute sovereignty violations — and users accept them in large numbers, often knowingly.

Three interpretations of voluntary delegation delimit the design space:
1. **False consciousness**: Users consent to freedom-reducing arrangements because they don't understand the long-term implications; the framework is justified in constraining their choices for their own benefit.
2. **Legitimate preference**: Users have genuinely different preference orderings — some value convenience over sovereignty; a framework that refuses this is paternalistic. Sovereignty should be an *available* option, not a mandatory architecture.
3. **Structural coercion**: Network effects make "voluntary" choice illusory — rejecting a platform may mean social or professional exclusion; the choice is formally free but substantively coerced by the cost of exit.

**This proposal adopts interpretation 3 as its operative assumption.** Interpretations 1 and 2 represent real boundary conditions — some users genuinely prefer managed arrangements, and some degree of paternalism is unjustified — but the modal case in markets with strong network effects is structural coercion, not genuine preference diversity. The distinguishing empirical test: when exit costs approach zero and genuine alternatives exist, do users continue to choose the freedom-reducing arrangement? Where they do, interpretations 1 and 2 may apply; where exit costs are high and alternatives absent, interpretation 3 applies.

[dead end: circular operationalization — the empirical distinguishing test requires conditions (zero exit costs, genuine alternatives) that are precisely the outcomes this proposal is designed to create, not conditions that currently exist. In status-quo markets — where the framework would be applied — exit costs are high and alternatives are absent by definition; interpretation 3 is therefore unfalsifiable in the cases where it is most operative. The test cannot distinguish structural coercion from genuine preference in current markets because it requires observing user behavior under counterfactual conditions. The framing is analytically coherent but operationally inert as a diagnostic tool; it describes a design goal, not a present-tense measurement. A proposal that adopts an operationally untestable assumption as its central framing has no mechanism to detect when that assumption is wrong.]

**Design implication of interpretation 3**: The system's obligation is not to prevent users from choosing freedom-reducing arrangements, but to ensure that genuine alternatives exist. This shifts the design target from individual consent to collective availability — the framework succeeds when users who want sovereignty can exercise it without prohibitive exit costs, not when all users are forced into sovereign configurations. A freedom-preserving ecosystem is one where structural coercion via network effects has been neutralized enough that preference genuinely varies.

**Graduated delegation and composable sovereignty**: The three-interpretation model treats delegation as binary — users either delegate a freedom or retain it. But the design space includes finer-grained structures: users who delegate execution (run code on a remote server) need not simultaneously delegate inspection (source access) or exit (data portability). Freedom-preserving architectures can separate these concerns, making freedoms independently exercisable rather than bundled. A user without the resources to self-host can still retain inspection rights and export rights; a user who delegates curation (algorithmic feeds) can still retain modification rights (feed control). This architectural target is **composable sovereignty** — individual freedoms are separately exercisable, not jointly enabled or disabled by a single architectural choice.

**Composable sovereignty: a decomposition matrix**: The five GNU freedoms (run, inspect, modify, redistribute, share improvements) map onto architectural decisions differently. Not all delegations imply all others:

| Freedom | Delegation mechanism | Independent from |
|---|---|---|
| Run (execution) | Remote computation, SaaS | Inspect, Modify, Redistribute |
| Inspect (source access) | Closed weights, obfuscation | Run, Redistribute |
| Modify (local adaptation) | Locked builds, no plugin surface | Run, Inspect |
| Redistribute (fork/share) | License restriction | Run, Inspect, Modify |
| Share improvements | Proprietary-only contribution | Redistribute |

A genuinely composable architecture allows users to delegate execution without surrendering inspection — for example, a remote inference API that provides source access and auditable training lineage. The architectural obligation is to identify which delegation decisions force bundled freedom-loss and to unbundle them where technically feasible. Where bundling is unavoidable, it must be documented as a conscious trade-off, not an invisible architectural default. Composable sovereignty is operationalized as a design requirement: each architectural decision must be assessed against the decomposition matrix to determine which freedoms it forecloses and whether that foreclosure is technically necessary.

**Proxy indicators for structural coercion**: The circular-operationalization problem (FPS-034) notes that the primary distinguishing test — do users continue to choose freedom-reducing arrangements when exit costs approach zero? — requires counterfactual conditions unavailable in current markets. The following proxy indicators operationalize the test under current conditions, providing falsifiable measurements that can be updated periodically:

- Whether functionally equivalent alternatives exist at any cost level (presence/absence proxy for "genuine alternatives exist")
- Whether exit costs are rising or falling over time (trend proxy for structural trajectory)
- Whether users who have exited report capability degradation (outcome proxy for whether alternatives are genuine)
- Whether the platform's market share is concentrated and growing or distributed and stable (structural proxy for network-effect lock-in)

These proxies measure correlates of structural coercion rather than the condition directly. They are falsifiable in current markets and can be updated periodically. A platform that passes all four in the direction of genuine preference diversity is less likely to represent structural coercion; one that fails three or more is more likely. The proxies do not resolve the conceptual problem raised by FPS-034 but they provide operational traction in current conditions.

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

**Tiered modifiability criterion**: The modifiability test scales with system scope. A single uniform criterion collapses for large complex systems where no individual practitioner can operate them alone. The appropriate standard is:

| System scope | Modifiability standard |
|---|---|
| Small system (single-person deployment) | A competent solo practitioner with publicly available documentation can modify and operate the system independently |
| Medium system (team-scale deployment) | A small team (3–5 practitioners) with publicly available documentation can fork, modify, and independently operate the system without contacting original authors |
| Large system (organizational deployment) | A well-staffed engineering team with publicly available documentation and tooling can fork and independently operate the system; modification should not require undocumented insider knowledge or access to the original vendor's infrastructure |

The tier does not relax the principle; it calibrates the test to the realistic actor who would exercise the freedom at each scale. A Linux-kernel-scale system that requires a skilled team to fork is still genuinely modifiable if a skilled team can in fact do it without vendor cooperation. The criterion fails if modification requires insider knowledge, undocumented toolchains, or coordination with original authors — regardless of scale tier.

[dead end: tier self-assignment without verification — tiers are claimed by the system's builders, not assigned by an external party. A vendor can claim "small system" classification to avoid the more demanding large-system requirements while deploying at enterprise scale. The criterion that determines the stringency of the modifiability test is set by the party being tested. Without an external classification mechanism or independent audit, the tiered criterion is as self-attestation-dependent as the AI-inspectability criteria (FPS-024) it was introduced to improve upon. Self-assigned tiers produce the compliance-theater failure mode in a new register.]

[dead end retained as partial: this tiered criterion improves on the original but does not fully resolve the production-scale AI system case. No team of any size can meaningfully fork a frontier AI model without access to training infrastructure and data that is not available under any open license. The tiered criterion applies to the system around the model (inference stack, fine-tuning pipeline, deployment infrastructure) but not to the model weights themselves as a modifiable artifact. The AI modifiability question remains structurally distinct from software modifiability.]

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

**Exit ecosystem as prerequisite**: The right to fork creates the *possibility* of alternatives; it does not create alternatives. An individual user's exit right is meaningful only when there is somewhere to exit to — a viable ecosystem of alternatives that provides comparable capability at non-prohibitive cost. A freedom-preserving design must consider not just whether users *can* exit but whether the exit option remains *credible*: whether alternatives exist, are maintained, and can absorb new users without degrading. An exit ecosystem has three components: (1) *availability* — alternative implementations exist; (2) *viability* — alternatives can serve a meaningful fraction of current users; (3) *discoverability* — users can find and evaluate alternatives without expert intermediaries. A system whose only fork died three years ago for lack of contributors, or whose fork requires a level of expertise that excludes most users, has formal exit rights but no credible exit ecosystem. The exit-option framing (§Theoretical Grounding) implies that maintaining this ecosystem is a shared obligation of freedom-preserving communities — not merely the individual obligation of the user who wishes to leave.

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

**Contributor obligations — hard and soft**: The proposal's rights-focused framing requires counterpart obligations. Users of a freedom-preserving commons benefit from the labor of contributors; the commons requires maintenance to remain operational. A framework that articulates extensive rights without addressing corresponding responsibilities produces the free-rider structure that historically depletes commons without governance.

Obligations fall into two tiers:

**Hard obligations** (enforceable through license terms or governance policy; must be satisfied to participate in the commons):
- **Attribution**: Modifications and redistributions preserve attribution chains so the improvement loop remains traceable. Attribution is a precondition for the shared improvement loop — without it, the loop becomes unverifiable and the collective history unrecoverable.

**Soft norms** (expected but not mandated; reinforced through community culture and recognition, not enforcement):
- **Non-weaponization**: Users who exercise exit rights do not actively degrade the commons they leave — for example, by using exit to extract and privatize shared assets. Because establishing that a fork was made "specifically to fragment" requires intent-determination that no license mechanism can adjudicate, this norm is appropriately enforced through community culture and governance reputation, not license terms. Soft-norm status does not diminish the norm's legitimacy; it correctly locates the enforcement mechanism where it can function.
- **Upkeep contribution**: Users who derive significant benefit from a commons contribute to its maintenance — through financial support, documentation, code, governance participation, or issue reporting.

**Rationale for the hard/soft distinction**: Mandating upkeep contribution as a hard obligation produces the unfunded-obligation anti-pattern at the individual level. It would require meaningful assessment of "significant benefit" (itself a governance problem), create enforcement overhead, and risk driving contributors away from the commons toward proprietary alternatives. Soft upkeep norms allow communities to develop culturally appropriate reciprocity expectations without imposing compliance costs that select for well-resourced participants. Attribution, by contrast, is binary and low-cost to comply with; its absence directly degrades the commons through unverifiable improvement history, making it appropriate for hard enforcement. Non-weaponization is a legitimate governance norm but requires intent-determination that defeats license enforcement, placing it correctly in the soft tier — where community culture can sustain it without creating a fork-suppression instrument.

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
- **Minimal footprint** [speculative]: systems that require the least possible infrastructure to run preserve freedom better than feature-equivalent systems with heavy infrastructure dependencies. Each required infrastructure component is a potential freedom-reducing dependency. A system that runs on a single machine with no external services has a radically smaller attack surface for freedom erosion than one that requires cloud services, managed databases, certificate authorities, and CDN delivery.
- **Freedom budget** [speculative]: each architectural decision either spends or saves from an implicit freedom budget — the total capacity for freedom that the system's design permits. External service dependencies, proprietary formats, opaque build processes, and API lock-ins are costs; local-first design, open formats, replaceable subsystems, and commons-governed dependencies are savings. Making the freedom budget explicit — as a tracked design artifact rather than an invisible consequence of individual decisions — allows architects to make cumulative trade-offs consciously. A system whose individual decisions each seem minor may have spent its freedom budget without anyone noticing. A freedom budget accounting requires: (1) enumerating every dependency and its governance status (costs the infrastructure footprint analysis already provides); (2) assigning a coarse freedom-cost rating to each (high/medium/low chokepoint potential); (3) tracking the total and alerting when the budget degrades across releases. This is related to the infrastructure dependency footprint documentation requirement but frames it as a running account rather than a point-in-time snapshot.

### The Infrastructure Dependency Stack

The principles above address application-layer freedom. But freedom-preserving applications sit atop an infrastructure stack whose lower layers are not addressed by application design choices:

| Layer | Examples | Freedom risk |
|---|---|---|
| Hardware | CPUs with firmware blobs, vendor-locked bootloaders | Tivoization at the physical layer |
| Network | BGP routing, DNS resolution, TLS certificate authorities | Centralized choke points that can block or intercept |
| Platform | App stores, operating system gatekeeping | Vendor veto over software distribution |
| Infrastructure services | CDNs, cloud storage, managed databases | Operational dependency on centralized providers |
| Application | The systems this proposal directly addresses | Complexity moat, cloudization, API capture |

A freedom-preserving application built on a captured infrastructure layer inherits the capture. A user who can freely inspect, modify, and fork application code but cannot run it without Google's certificate authority infrastructure or Apple's distribution mechanisms has a constrained form of freedom.

This is not an argument that application-layer freedom is worthless — it is an argument that the proposal's scope should acknowledge the infrastructure dependency ceiling explicitly and design against it.

**Design implication**: Freedom-preserving systems must document their infrastructure dependency footprint — an enumeration of every external dependency at each layer above, with the governance status of each dependency (commercially controlled, commons-governed, or self-hostable). Systems should prefer dependencies that are themselves governed as commons (e.g., IETF-standardized protocols, distributed certificate transparency systems, open hardware designs) over commercially controlled dependencies, even when the commercial dependency is currently permissive. The preference is not absolute — a commercially-controlled dependency may be the only viable option at a given layer — but it must be a conscious, documented choice, not an invisible default.

**Connection to freedom-decay**: Infrastructure capture is a primary accelerant of freedom-decay. A system that documents its infrastructure footprint at t=0 and reassesses it periodically will detect when initially permissive commercial dependencies have become load-bearing lock-ins before those lock-ins become irremovable. The infrastructure dependency footprint is therefore both a design artifact and a periodic assessment input (see §Freedom Decay and Periodic Assessment).

**Freedom-inheritance** [speculative]: The infrastructure dependency stack implies a compositional property: a system's practical freedom ceiling is determined by its most-captured dependency at any layer. A freedom-preserving application built atop a commercially-controlled CDN has a practical freedom ceiling lower than its application-layer design implies — the CDN provider can restrict access regardless of application code. Stated as a principle: *a system's practical freedom is at most equal to the practical freedom of its least-free dependency, regardless of the freedom properties of other components*.

This principle has an architectural implication beyond the documentation requirement already specified: when analyzing the infrastructure footprint, each dependency should be assessed not only for governance status but for *chokepoint potential* — whether the dependency holder could restrict system access in ways not anticipated by the application design. A dependency with low chokepoint potential (a widely-implemented IETF protocol) may be more freedom-preserving than a theoretically self-hostable dependency (running one's own TLS certificate authority) that is practically never self-hosted because the cost is prohibitive. The goal is not theoretical self-hostability but practical non-capture.

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

**Alternative governance model: user cooperative**: The minimal governance structure above addresses how standards are governed, but leaves open how *platforms* are governed. Multi-stakeholder standards bodies are procedurally inclusive but not ownership-inclusive — well-resourced actors dominate regardless of governance structure. An underexplored alternative is the **platform cooperative** model: users collectively own and govern the platform through cooperative ownership mechanisms (democratic voting rights, profit sharing, board representation). This is distinct from:
- Multi-stakeholder standards bodies (which include non-user stakeholders and separate governance from ownership)
- Individual sovereignty (which creates individual rights without collective voice)
- Commons governance (which addresses shared infrastructure, not platform operation)

Platform cooperatives have an empirical track record (credit unions, worker-owned firms, agricultural cooperatives) that provides a design baseline distinct from open-source governance experiments. The governance-capture failure mode (§Failure Modes #3) is structurally different in a cooperative: governance power is proportional to user membership, not to resources spent on standards participation. The tradeoffs are real — cooperative governance is slower, requires active participation infrastructure, and doesn't scale easily — but it represents a distinct failure mode profile from multi-stakeholder bodies, not a strictly worse or better alternative.

[speculative extension: **federated cooperative** — rather than a single user cooperative operating a platform, a network of interoperable cooperatives operating compatible implementations of a shared protocol. This combines the exit-ecosystem requirement (viable alternatives) with cooperative ownership (user governance) at each node. Each node is locally governed; the protocol is commonly governed. This is the institutional form that the active-governance framing implies at scale.]

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

*Provisional position*: A restriction is legitimate when it protects the user from external threats; it is illegitimate when it protects the vendor's control from the user. The distinguishing test — who does the restriction primarily protect? — is not in itself operationalizable from outside the restriction. The same firmware lock simultaneously protects against rootkits and prevents user-modified software; these effects are architecturally inseparable.

**Evidence standard for security-justified restrictions (imperfect but better than the binary test)**: A security-based restriction on user modification is presumptively legitimate if and only if all three of the following conditions are met:

1. **Published threat model**: The vendor has published a threat model that specifically identifies the attack class the restriction defends against, at sufficient detail for an independent security researcher to evaluate the claim.
2. **Narrow scope**: The restriction is scoped narrowly to the attack surface it defends — it does not incidentally prevent modification in domains unrelated to the identified threat. If the restriction prevents more than the threat model requires, the excess is presumptive tivoization.
3. **No coincident lock-in benefit**: The restriction does not coincidentally serve the vendor's lock-in interests. Where a restriction simultaneously provides security and prevents vendor substitution, the vendor bears the burden of demonstrating that the security objective could not be achieved with a less freedom-restricting mechanism.

This evidence standard does not eliminate the operationalization problem — vendors can publish thin threat models and claim narrow scope — but it shifts the burden of justification, creates a public record that can be scrutinized, and narrows the set of restrictions that can be legitimately asserted without challenge. An unevidenced restriction is presumptively illegitimate under this standard even if a security justification is theoretically available.

[genuine unresolved tension: conditions 1–3 are assessable only by parties with security expertise, which most users lack. The evidence standard creates a security-researcher-level accountability mechanism, not a user-level accountability mechanism. It is meaningful progress over no standard, but it does not resolve the access asymmetry between users and vendors.]

**2. Formal Freedom vs. Practical Freedom**
Addressed as the cross-cutting framework. *Provisional position*: practical freedom is the operative standard; formal freedom is necessary but not sufficient. Systems that only provide formal freedom are non-compliant with this proposal's intent.

**3. Individual Sovereignty vs. Collective Commons**
Addressed under User Sovereignty §1. *Provisional position*: individual exit rights take priority; collective resilience is a design responsibility, not a constraint on exit.

**4. Freedom vs. Economic Sustainability**
*Unresolved — and the highest-severity structural failure mode in this proposal.* This tension is treated at length in §Failure Modes #1 (Economic Gravity), which documents the historical pattern and its severity. The short summary: freedom-preserving systems cannot extract monopoly rents from lock-in; the permissive-to-proprietary pipeline is the modal outcome for successful freedom-preserving projects; no governance structure proposed here has resisted it at scale. Every other principle in this document is downstream of whether the project survives economically.

**5. Positive vs. Negative Freedom**
Addressed under Modifiability §3. *Provisional position*: system builders have positive architectural obligations to enable the exercise of freedoms, not just negative obligations to refrain from restricting them. This is an intentional extension beyond the GNU definition's negative-liberty register.

**6. AI Systems and Freedom**
Partially addressed under Inspectability §2. The deeper question — whether consequential AI decisions are ever meaningfully inspectable in the relevant sense — remains open. A user who can audit training lineage and test decision boundaries is in a meaningfully better position than one who cannot. But a probabilistic model trained on shared corpora exercises a form of influence that is not fully decomposable into inspectable parts. *Provisional position*: freedom-preserving AI systems must be auditable (lineage and training decisions documented), testable (behavior probeable by users), and interruptible (users can override, reject, or exit AI-driven workflows without losing capability). Full mechanistic transparency may not be achievable; auditability, testability, and interruptibility are achievable and are the operative standard.

**7. Freedom Across Time**
The temporal dimension is almost entirely absent from this proposal's five core principles. The cross-cutting framework treats freedom as a static property that a system either has or lacks at a given point. The temporal framing (see §Theoretical Grounding) surfaces a distinct problem that is now developed concretely in the two sections below.

---

## Freedom Decay and Periodic Assessment

### Freedom-Decay: The Temporal Erosion of Practical Freedom

**Freedom decay** is the gradual erosion of practical freedom through processes that require no deliberate decision by any actor. A system designed to be free at t=0 can become unfree at t=n through structural drift alone:

| Decay vector | Mechanism | Observable indicator |
|---|---|---|
| Documentation staleness | Modification activation energy rises as code diverges from documentation | Ratio of code changes to documentation changes; time-to-first-contribution for new contributors |
| Contributor concentration | Governance knowledge concentrates in a shrinking group; bus-factor approaches 1 | Number of active contributors; concentration of commit authorship (Gini coefficient) |
| Dependency accumulation | External service dependencies become load-bearing; removal cost grows | Count of external service dependencies; proportion that are commercially controlled vs. commons-governed; last-assessed date on each |
| Network effect growth | Alternatives become less viable as the dominant instance accumulates users | Market share of dominant instance vs. alternatives; estimated switching cost |
| Codebase comprehension ceiling | Complexity grows beyond any individual's comprehension; modifiability tier degrades | Cyclomatic complexity trend; lines of code per contributor |

These processes are independent of the original architecture and of any actor's intentions. Freedom decay is the temporal equivalent of technical debt: invisible, compounding, and recoverable only with deliberate investment.

**Infrastructure capture as accelerant**: When commercially-controlled infrastructure dependencies become load-bearing (see §Infrastructure Dependency Stack), they accelerate freedom-decay across all vectors. A dependency that was non-critical at t=0 may become architecturally entrenched at t=n; periodic reassessment of the infrastructure footprint is the primary mechanism for detecting this before it becomes irremovable.

### Periodic Freedom Assessment

Freedom-preserving systems should conduct **periodic freedom assessments** — structured reviews of whether the system's practical freedoms remain exercisable. A lightweight assessment mechanism:

**Assessment inputs** (reviewable without insider access):
- Documentation staleness: last-updated dates on key docs vs. last code changes in corresponding modules
- Contributor concentration: active contributors over the prior 12 months; authorship Gini coefficient
- Infrastructure dependency footprint: current enumeration vs. prior enumeration; governance status of each dependency
- Modifiability tier test: can a team at the appropriate tier (see §Modifiability) successfully modify and operate the system using only public documentation?
- Exit cost test: can a user export all data and switch to an alternative within a documented process?

**Assessment cadence**: Annual for stable projects; semi-annual for projects with rapid dependency or contributor change; triggered ad hoc by any of: a key contributor departure, a significant dependency governance change (e.g., a commons-governed dependency acquired commercially), or a major architectural change.

**Intervention threshold**: An assessment that finds any two of the five indicators degraded from the prior period should trigger a remediation plan. A single degraded indicator is a warning; two is a pattern; three is a crisis.

**Assessment governance**: Assessments should be conducted by a party with standing in the community but without sole authority over the system — ideally a contributor collective or an independent steward body, not the primary vendor.

[island: independent assessors and watchdog communities — structural-disengagement resistance: parties with the expertise to conduct genuine freedom assessments (infrastructure governance audit, contributor concentration measurement, modifiability-tier testing) are uncompensated, have no enforcement standing, and have no mechanism to compel vendors to respond to findings. The governance clause describes conditions that obtain in a healthy, well-resourced community — precisely the conditions under which assessment is least urgent. When assessment is most needed (vendor consolidation, contributor attrition, governance capture), the parties with standing and independence to assess are being marginalized by the same forces the assessment is meant to detect. The mechanism assumes the existence of a persistent watchdog community that historically does not form without dedicated funding or regulatory mandate.]

[dead end: assessment mechanism as unfunded obligation at the meta-level — the periodic assessment mechanism has no governance charter, no funding model, no enforcement authority, and no institutional home. It is an obligation imposed on the community without a corresponding resource commitment. This is the unfunded-obligation anti-pattern (FPS-027) applied recursively: the mechanism designed to detect freedom-decay is itself subject to freedom-decay through the same disengagement and resource-attrition it was built to monitor. An assessment mechanism that decays is indistinguishable from no assessment mechanism; a non-binding assessment mechanism is indistinguishable from a compliance document.]

**Automated freedom-decay detection**: Given that human assessors are structurally unlikely to materialize or persist without dedicated funding (see island and dead end above), the preferred design direction is to embed machine-measurable freedom-decay indicators in the system's standard release infrastructure — CI/CD pipelines, package metadata, and repository analytics:

- *Documentation staleness ratio*: lines of code changed vs. documentation lines changed, computed per release; a declining ratio is an early decay indicator
- *Contributor concentration*: authorship Gini coefficient computed from git log, published alongside each release
- *Dependency governance status*: automated SBOM-style audit of each dependency's governance classification (commercially controlled vs. commons-governed), flagging newly-commercial dependencies on each update
- *Build reproducibility*: whether a clean build from only public documentation and public dependencies succeeds in an isolated environment, tested on each release

These indicators do not require a dedicated assessor body — they require that maintainers commit to computing and publishing them. The structural limitation is the same as for human assessors: maintainers under resource pressure are least likely to invest in decay monitoring. However, if these metrics can be integrated with existing compliance infrastructure (SBOM generation is an emerging norm for supply-chain security; reproducible build requirements are expanding in several regulatory contexts), the marginal cost approaches zero. The key design question is whether freedom-decay indicators can ride alongside compliance indicators already mandated by other frameworks — if so, the meta-governance-gap may be partially closeable through incidental regulatory alignment rather than requiring dedicated governance.

### Regulatory Alignment as Bootstrap Strategy

The compliance-sovereignty conflict (FPS-026, §Failure Modes #2) frames regulation as adversarial to user freedom — and for many regulatory requirements, it is. But several emerging regulatory frameworks independently converge on conditions that this proposal endorses, creating opportunities for **regulatory alignment**: situations where compliance with independent regulatory requirements incidentally produces freedom-preserving outcomes, without requiring freedom-preservation advocates to be the primary political actor.

**Convergent regulatory requirements**:

| Regulatory framework | Requirement | Freedom-preserving analog |
|---|---|---|
| GDPR Article 20 (EU) | Data portability: users can export their data in a machine-readable format | Exit without loss (reversibility criterion 2) |
| EU Cyber Resilience Act / US EO 14028 | Software Bill of Materials (SBOM) for critical software | Infrastructure dependency footprint documentation |
| Right-to-Repair legislation (EU, US states) | Hardware vendors must provide repair documentation and diagnostic tools | Modifiability-first-class at the hardware layer |
| NIS2 / DORA (EU) | Dependency risk management; supply chain transparency | Freedom-decay monitoring; dependency governance status |
| Digital Markets Act (EU) | Interoperability mandates for gatekeepers | Protocol-level value; exit ecosystem viability |

These are not identical to the freedom-preservation requirements proposed here — the regulatory framings have narrower scope, different enforcement mechanisms, and different political origins. But the overlap is non-trivial: a system that satisfies GDPR Article 20 has partially satisfied the reversibility and data-sovereignty requirements in this proposal, whether or not the system's designers intended freedom-preservation.

**Design implication**: Freedom-preserving systems should identify which of their requirements are incidentally satisfied by regulatory compliance in their target jurisdictions, and structure compliance documentation to serve double duty — satisfying regulatory requirements while also generating the freedom-assessment inputs specified in §Periodic Freedom Assessment. The SBOM generated for supply-chain security compliance is also an infrastructure dependency footprint for freedom-decay monitoring. The data portability mechanism implemented for GDPR is also the exit-without-loss mechanism for reversibility. This doubles the value of a single compliance investment without requiring additional political advocacy.

**Limit of the strategy**: Regulatory alignment is incidental and jurisdiction-specific. GDPR applies in the EU; right-to-repair legislation varies by jurisdiction; many of the converging requirements are contested and may be weakened. The strategy does not substitute for dedicated freedom-preservation governance — it supplements it by reducing the marginal cost of some assessments in some jurisdictions. The meta-governance-gap (FPS-033) is not closed by incidental regulatory alignment; it is narrowed in favorable regulatory environments.

---

## Reversibility: A Sub-Principle of User Sovereignty

**Reversibility** is the property that allows users to undo state changes, exit configurations, and restore prior capability without data loss.

Reversibility is related to but distinct from:
- **Forkability** (FPS-017/FPS-020): a community's ability to continue the system without the original vendor — a *collective* continuity mechanism
- **Data portability** (component of FPS-009): the ability to export data in a usable format — a *transfer* mechanism
- **Exit rights** (component of FPS-001): the legal/technical permission to leave — a *permission* mechanism

Reversibility is an *individual*, *temporal* mechanism: can a *single user* undo a specific decision or configuration change and return to a prior state without losing the capability they had before?

**Why reversibility is a distinct requirement**: A system can provide full data portability (you can export everything) without providing reversibility (you cannot undo the last configuration change without losing state). A system can provide exit rights (you are permitted to leave) without providing reversibility (leaving destroys your accumulated configuration). These are different failure modes.

**Reversibility as a sub-principle of User Sovereignty**: Reversibility operationalizes the anti-domination framing at the individual action level. A system in which user actions are routinely irreversible concentrates effective authority in the system's design, not in the user — because the cost of an irreversible action makes cautious non-use the rational strategy. The aggregate effect of irreversible actions is a system that chills user agency through accumulated exit costs.

**Testable reversibility criteria**:
1. **State undo**: A user who changes a configuration or executes an automation can restore the prior state using system-native mechanisms within a documented process.
2. **Exit without loss**: A user who exits a workflow, integration, or configuration retains all data and capability they had before entering it, exportable in a documented format.
3. **Legible-defaults**: The reversibility status of every default or action must be communicated to the user at the point of encounter — not in documentation. This criterion replaces the stronger "no irreversible defaults" formulation, which was structurally incompatible with security-by-design practices: cryptographic key generation, passphrase hashing, certificate enrollment, secure boot state, and database schema migrations are intentionally irreversible defaults, and the irreversibility is the security mechanism. Legible-defaults separates two distinct obligations:
   - **Disclosure obligation** (hard): the system must communicate whether an action or default is reversible, and at what cost, before the user commits to it — at the point of encounter, not in documentation.
   - **Reversibility obligation** (where feasible): for non-security-critical defaults, the system should prefer reversible configurations; where irreversibility is technically necessary, the disclosure obligation applies in full.

   Under this criterion, a system that makes cryptographic key generation irreversible satisfies the standard by informing the user clearly that the key cannot be regenerated, rather than by making it reversible. The anti-domination protection is preserved through user awareness: a system in which most defaults are legibly irreversible still concentrates authority in system design, but does so with user awareness rather than through concealment. Whether disclosure is sufficient or merely converts coercion into informed coercion remains a genuine open question — but legible-defaults is achievable by security-conscious systems, while no-irreversible-defaults is not.

4. **Degradation transparency**: Where irreversible actions are technically unavoidable (e.g., deletion), the system makes their irreversibility explicit at the point of action, not in documentation.

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

### 7. Assessment Mechanism Decay (Meta-Governance Gap)
The periodic freedom assessment mechanism proposed in §Freedom Decay is itself ungoverned and unfunded. The mechanism requires a persistent assessor body with standing, technical competence to evaluate infrastructure governance and contributor concentration, and institutional authority to trigger remediation. No funding model, governance charter, or enforcement mechanism is proposed for the assessment function itself. An unfunded, unchartered assessment mechanism produces one of two outcomes: assessments do not occur (the mechanism decays through disengagement), or assessments occur but findings are non-binding (the mechanism persists as compliance theater). This is the unfunded-obligation anti-pattern applied recursively — the mechanism designed to detect freedom-decay is itself subject to freedom-decay. The mechanism also presupposes an independent assessor community that historically does not form without dedicated funding or regulatory mandate.

**Mechanism**: Assessment mechanism is proposed without its own governance or funding → assessors have no institutional standing → assessments either lapse or produce non-binding findings → freedom-decay continues undetected while the assessment mechanism provides false assurance.

### 8. Non-Weaponization Unenforceability
~~The contributor obligations framework classifies non-weaponization as a hard obligation enforceable through license terms or governance policy.~~ **Resolved in cycle 008**: Non-weaponization has been reclassified to the soft-norm tier in §Shared Improvement Loop. Attribution remains the only hard obligation. The failure mode is closed for the current framework formulation.

**Original mechanism** (no longer active): Intent-dependency makes non-weaponization unenforceable as a hard obligation → hard-obligation framing is invoked as justification for fork exclusion → the obligation becomes a governance-concentration instrument rather than a commons-protection mechanism.

### 9. Reversibility/Security Contradiction
~~Testable reversibility criterion 3 ("no irreversible defaults") is structurally incompatible with modern security-by-design practices.~~ **Partially resolved in cycle 008**: Criterion 3 has been replaced with the legible-defaults criterion in §Reversibility, separating the disclosure obligation (hard: reversibility status must be communicated at point of encounter) from the reversibility obligation (where feasible: prefer reversible defaults for non-security-critical operations). Security-by-design irreversibility satisfies the criterion through disclosure rather than reversal. The remaining open question — whether disclosure converts coercion into informed coercion rather than eliminating it — is noted in §Reversibility as a genuine open tension.

**Residual mechanism**: Legible-defaults is a weaker anti-domination protection than no-irreversible-defaults; a system in which most defaults are legibly irreversible still concentrates authority in system design, with awareness but without recourse.

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
| 2026-05-24 | Strawman pass: expand solution space with new framings and underdeveloped concepts | Added temporal framing as fifth alternative; voluntary delegation as distinct sovereignty mechanism; infrastructure dependency stack section; contributor obligations to shared improvement loop; freedom-across-time as seventh unresolved tension; minimal footprint to preferred characteristics |
| 2026-05-24 | Steelman pass: promote emergent concepts and resolve dead ends | (1) Promoted temporal framing from [speculative]; (2) Added freedom-decay section with concrete indicators and periodic assessment mechanism; (3) Added Reversibility as sub-principle of User Sovereignty with testable criteria; (4) Committed to structural coercion framing for voluntary delegation with explicit design implication; (5) Distinguished hard/soft contributor obligations with rationale for the distinction; (6) Promoted infrastructure dependency stack, removed [speculative], added documentation requirement and freedom-decay connection; (7) Replaced modifiability dead end with tiered criterion (solo/small-team/large-team); (8) Replaced security/freedom dead end with evidence standard (threat model + narrow scope + no coincident lock-in); (9) Consolidated economic sustainability duplicate — tension §4 now points to Failure Modes §1; (10) Updated crucible_state to steelman |
| 2026-05-24 | Adversarial pass (cycle 006): annotate new dead ends, islands, and failure modes | (1) Flagged voluntary delegation empirical test as circular operationalization — the distinguishing test requires conditions that are the proposal's design goal, not current conditions; (2) Flagged non-weaponization as misclassified hard obligation — intent-determination defeats enforceability, creates fork-suppression instrument; (3) Added tier self-assignment dead end to tiered modifiability criterion — tiers are vendor-claimed with no external verification; (4) Flagged reversibility criterion 3 as conflicting with security-by-design practices — irreversible defaults are a security mechanism; (5) Flagged assessment governance as vacuous under pressure — clause describes healthy community, provides no mechanism when community is not healthy; added meta-governance-gap dead end; (6) Added Failure Modes 7–9 (Assessment Mechanism Decay, Non-Weaponization Unenforceability, Reversibility/Security Contradiction); (7) Added concepts FPS-033 (meta-governance-gap) and FPS-034 (circular-operationalization); (8) Updated crucible_state to adversarial |
| 2026-05-24 | Strawman pass (cycle 007): expand solution space with alternative framings and underdeveloped concepts | (1) Added exit-option and active-governance framings as sixth and seventh alternatives; (2) Expanded graduated delegation into composable sovereignty with a decomposition matrix; (3) Added exit-ecosystem concept to Right to Fork — individual exit requires viable destination ecosystem; (4) Added user-cooperative governance model as alternative to multi-stakeholder standards bodies; (5) Added federated cooperative as speculative institutional extension; (6) Added freedom-budget to preferred characteristics; (7) Added legible-defaults as alternative resolution to reversibility criterion 3 dead end; (8) Added regulatory alignment subsection in Freedom Decay — convergent regulatory requirements as bootstrap strategy; (9) Added concepts FPS-035 (exit-ecosystem), FPS-036 (legible-defaults), FPS-037 (user-cooperative-governance), FPS-038 (freedom-budget), FPS-039 (regulatory-alignment) |
| 2026-05-24 | Steelman pass (cycle 008): promote emergent concepts, resolve two failure modes, strengthen operational mechanisms | (1) Reclassified non-weaponization from hard obligation to soft norm — intent-determination defeats license enforcement; resolves Failure Mode 8; (2) Replaced reversibility criterion 3 ("no irreversible defaults") with legible-defaults criterion — separates disclosure obligation (hard) from reversibility obligation (where feasible); partially resolves Failure Mode 9; (3) Promoted proxy indicators for structural coercion from speculative to first-class — operationalizes FPS-034 under current market conditions; (4) Promoted graduated delegation / composable sovereignty from speculative — added design requirement framing; added FPS-040 (composable-sovereignty) to registry; (5) Promoted exit-ecosystem from speculative — three-component definition (availability, viability, discoverability) is testable; (6) Promoted regulatory alignment section from speculative — convergent regulatory table has sufficient empirical backing; (7) Promoted automated freedom-decay detection from speculative — integration path via SBOM compliance infrastructure is concrete; (8) Promoted user-cooperative governance from speculative — empirical track record (credit unions, worker-owned firms) provides design baseline; kept federated cooperative speculative; (9) Updated Failure Modes 8 and 9 to note resolution/partial resolution |
