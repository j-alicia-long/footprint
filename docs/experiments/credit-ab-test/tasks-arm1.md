# Tasks

Tracer-bullet tickets for [Spec: AI Carbon Footprint v1](https://github.com/j-alicia-long/ai-carbon-footprint/issues/1). Each ticket is a vertical slice — demoable on its own, sized for a single fresh context window. Work the frontier: any ticket whose blockers are all done.

---

## 01 — Scaffold app + web-config tooling

**What to build:** A running React + Vite (TypeScript) static site with all shared conventions enforced from the first commit. `bun run dev` serves a placeholder page; lint, typecheck, and a smoke test all pass; committing triggers the pre-commit pipeline.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Vite + React + TS app scaffolded; dev server serves a placeholder page
- [ ] `@j-alicia-long/web-config` pinned to release tag `v0.1.1` as a git dev dependency
- [ ] ESLint spreads the web-config preset; Stylelint extends it; `tsconfig.json` extends the base
- [ ] `web-conventions` skill copied into `.github/skills/` with a `sync-skills` script
- [ ] husky + lint-staged pre-commit runs Prettier + ESLint on staged files, then typecheck and test
- [ ] One passing smoke test establishes the test runner

## 02 — Walking skeleton: one Scenario → Energy on page

**What to build:** The first end-to-end path: a visitor sees one preset Scenario card, and the page shows its central Energy (Wh) as a bold number, computed by the `computeFootprint` seam from the Scenario Recipe and Coefficient Set — no placeholder math.

**Blocked by:** 01 — Scaffold app + web-config tooling.

**Status:** ready-for-agent

- [ ] One Scenario defined as data (Model Class + output-token count Recipe, hidden from the visitor)
- [ ] `computeFootprint(scenario)` returns central Energy in Wh using the EcoLogits regression plus server power and PUE from the bundled Coefficient Set
- [ ] The card and its bold Energy number render on the page
- [ ] A seam test asserts the computed Energy for the known Recipe

## 03 — Full Footprint math: Carbon + Uncertainty Bands

**What to build:** Every Footprint number becomes honest: Energy and Carbon (gCO₂e) each show a bold central figure with a small min–max Uncertainty Band beneath, driven by the Model Class's active-parameter range, all computed in the single seam.

**Blocked by:** 02 — Walking skeleton.

**Status:** ready-for-agent

- [ ] Model Classes (frontier / mid / small) defined with parameter ranges from EcoLogits' closed-model proxies
- [ ] min/central/max propagate through the full computation, including embodied hardware amortization
- [ ] Carbon derived from Energy via location-based grid intensity (world default), per ADR 0001
- [ ] Golden-value test: ~1,000-token frontier Scenario lands in the ~5–11 gCO₂e range
- [ ] Invariant tests: min ≤ central ≤ max; Carbon linear in grid intensity; Energy monotonic in tokens; smaller Model Classes never exceed larger on the same Recipe
- [ ] UI shows the band small beneath each bold central number

## 04 — Equivalents

**What to build:** The Footprint translated into familiar real-world actions — "3 minutes of TV", "40 m of driving" — each converted from Energy or Carbon via a published Coefficient and displayed with the Footprint.

**Blocked by:** 03 — Full Footprint math.

**Status:** ready-for-agent

- [ ] Equivalent conversion Coefficients bundled as data, each with its citation
- [ ] `computeFootprint` returns the list of Equivalents alongside Energy and Carbon
- [ ] Equivalents render with the Footprint and update with the Scenario
- [ ] Seam tests assert Equivalent values for known Footprints

## 05 — Methodology Notes

**What to build:** Every displayed figure reveals its citation and boundary statement on hover, with a keyboard/touch-accessible fallback — rendered from the same Coefficient records the math uses, so a number and its source can never drift apart.

**Blocked by:** 03 — Full Footprint math.

**Status:** ready-for-agent

- [ ] Every Coefficient record carries source name, year, and link
- [ ] Each displayed figure (Energy, Carbon, each Equivalent) has a Methodology Note
- [ ] Notes open on hover and via keyboard focus or tap
- [ ] Test asserts every displayed figure carries a Methodology Note reference

## 06 — Full Scenario set + card switching

**What to build:** The complete preset Scenario lineup spanning light to heavy activities across Model Classes ("ask ChatGPT a question", "an afternoon of agent coding", "plan a trip", …). Picking any card updates the whole Footprint immediately.

**Blocked by:** 03 — Full Footprint math.

**Status:** ready-for-agent

- [ ] All v1 Scenarios defined as data with Recipes spanning Model Classes and token counts
- [ ] Selecting a card immediately recomputes and re-renders the Footprint
- [ ] No knobs, no freeform token entry — preset cards only
- [ ] UI smoke test: clicking a Scenario card renders that Scenario's computed central numbers

## 07 — Nature theme, responsive + a11y polish, "why higher" explainer

**What to build:** The finished public page: green nature-themed visual design, readable and usable on a phone, accessible throughout, with an explainer panel preempting the top objection — why these numbers are ~5–30× higher than provider-marketing figures (deliberate full-stack, location-based boundary per ADR 0001).

**Blocked by:** 04 — Equivalents; 05 — Methodology Notes; 06 — Full Scenario set.

**Status:** ready-for-agent

- [ ] Green nature-themed design applied across the page
- [ ] Layout is readable and usable on mobile
- [ ] "Why our numbers are higher" explainer panel references the boundary choice
- [ ] Accessibility pass: Methodology Notes and card selection fully keyboard/touch operable
