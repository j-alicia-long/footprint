# Tickets: AI Carbon Footprint page

Tracer-bullet vertical slices. Work the frontier: any ticket whose blockers are all done.

---

# 01 — Walking skeleton: one Scenario, one Footprint

**What to build:** A visitor opens the page and sees one preset Scenario — "ask ChatGPT a question" — with its estimated Energy (Wh) and Carbon (gCO₂e) Footprint, computed live in the browser from a Coefficient Set of published constants. React + Vite static site, no backend.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] Vite + React project scaffolded with a test runner
- [ ] Coefficient Set module holds the EcoLogits energy-per-token regression (α=1.17e-6, β=−0.0112, γ=4.05e-5, batch 64), PUE, and location-based grid intensity — each constant carrying its citation
- [ ] Footprint follows ADR 0001: full-stack boundary (GPU + server + PUE + amortized embodied hardware), location-based Carbon derived from Energy
- [ ] One hardcoded Scenario with a hidden Scenario Recipe (Model Class + output-token count) renders its Energy and Carbon on the page
- [ ] Unit tests verify the Footprint math against hand-computed values

---

# 02 — Deploy pipeline

**What to build:** The page is live at a public URL, and every push runs the tests and redeploys — so every later slice is demoable in production.

**Blocked by:** 01 — Walking skeleton

**Status:** ready-for-agent

- [ ] Static build deploys to GitHub Pages (or equivalent) on push to main
- [ ] CI runs the unit tests and blocks deploy on failure
- [ ] Live URL shows the walking-skeleton Scenario and Footprint

---

# 03 — Uncertainty Band

**What to build:** Every Footprint shows a bold central estimate with a small min–max range beneath it, honestly reflecting unknown closed-model parameter counts (min/mean/max propagated through the energy regression per Model Class).

**Blocked by:** 01 — Walking skeleton

**Status:** ready-for-agent

- [ ] Each Model Class carries min/mean/max active-parameter estimates
- [ ] Footprint math propagates the range end-to-end: Energy and Carbon each get min/central/max
- [ ] Display: bold central number, small min–max range beneath, for both metrics
- [ ] Unit tests cover range propagation (min ≤ central ≤ max, correct units)

---

# 04 — Full Scenario card set

**What to build:** The visitor picks from the full set of preset Scenario cards — e.g. "ask ChatGPT a question", "an afternoon of agent coding", "plan a trip" — and the Footprint recomputes for the selected card. No knobs, no freeform input.

**Blocked by:** 01 — Walking skeleton

**Status:** ready-for-agent

- [ ] All preset Scenarios defined, each with a hidden Scenario Recipe (Model Class + output-token count) grounded in research.md figures
- [ ] Scenarios span Model Classes (frontier / mid / small) and realistic token volumes (agentic scenarios are token-heavy)
- [ ] Selecting a card updates the displayed Footprint
- [ ] Recipes are never shown to or editable by visitors

---

# 05 — Equivalents

**What to build:** Beneath the Footprint, the visitor sees familiar real-world actions with the same footprint — "3 minutes of TV", "40 m of driving" — each converted from Energy or Carbon via a published Coefficient.

**Blocked by:** 01 — Walking skeleton

**Status:** ready-for-agent

- [ ] Equivalent conversion factors added to the Coefficient Set, each with its citation
- [ ] At least three Equivalents render per Scenario, converting from Energy or Carbon
- [ ] Equivalents recompute when the Scenario changes
- [ ] Unit tests verify conversions against hand-computed values

---

# 06 — Methodology Notes on hover

**What to build:** Hovering (or tapping) any displayed figure — Footprint numbers, Uncertainty Band, each Equivalent — reveals its Methodology Note: the citation and boundary statement behind that number, including why these figures run ~5–30× higher than provider-marketing numbers (ADR 0001).

**Blocked by:** 03 — Uncertainty Band; 05 — Equivalents

**Status:** ready-for-agent

- [ ] Every displayed figure has a Methodology Note revealed on hover/tap
- [ ] Notes cite the source coefficient(s) and state the measurement boundary
- [ ] The boundary rationale from ADR 0001 is surfaced (full-stack, location-based; deliberately higher than marketing figures)
- [ ] Works with keyboard and touch, not just mouse hover

---

# 07 — Nature theme & visual polish

**What to build:** The finished green, nature-themed look: the visitor lands on a calm, plant-inspired page where Scenario cards, the bold Footprint number, Uncertainty Band, and Equivalents sit in the final responsive layout.

**Blocked by:** 04 — Full Scenario card set; 05 — Equivalents

**Status:** ready-for-agent

- [ ] Cohesive nature-themed visual design (palette, type, imagery) applied across the page
- [ ] Responsive layout works on mobile and desktop
- [ ] Final hierarchy: Scenario cards → bold central Footprint with band → Equivalents
- [ ] No regressions in tests or deploy
