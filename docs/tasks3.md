# Tickets — AI Carbon Footprint v1

Source: [#1 — Spec: AI Carbon Footprint v1](https://github.com/j-alicia-long/ai-carbon-footprint/issues/1)

Tickets are tracer-bullet vertical slices in dependency order (blockers first). Work the frontier: any ticket whose blockers are all done can start.

---

# 01 — Scaffold deployable static site with web-config conventions

**What to build:** A visitor can load a live, publicly hosted placeholder page for the project. The repository is a working React + Vite + TypeScript + SCSS static site that consumes `@j-alicia-long/web-config` (pinned to `v0.1.1` as a git dev dependency): ESLint flat-config preset, Stylelint preset, `tsconfig.json` extending the base config with app-specific options kept local. The `web-conventions` agent skill is copied into `.github/skills/` with a `sync-skills` script. Pre-commit runs via husky + lint-staged (Prettier + ESLint on staged files, then typecheck and test). A test runner is wired with one passing placeholder test. The site deploys to free static hosting so every later slice is publicly demoable.

**Blocked by:** None — can start immediately.

**Status:** done

- [x] `npm run dev` serves a placeholder page; production build succeeds
- [x] ESLint, Stylelint, and typecheck all pass using the web-config presets
- [x] Pre-commit hook runs Prettier + ESLint on staged files, then typecheck and test
- [x] `web-conventions` skill committed under `.github/skills/` with a working `sync-skills` script
- [x] Placeholder page is deployed and reachable at a public URL with no backend — https://footprint-jlong.zocomputer.io via `scripts/deploy-zo.sh` (builds `dist/` and syncs it to the Zo site over the Zo MCP API)

---

# 02 — First tracer Scenario: one card shows Energy with Uncertainty Band

**What to build:** A visitor sees one preset Scenario card (e.g. "ask ChatGPT a question") displaying its Energy Footprint: a bold central watt-hour number with a small min–max Uncertainty Band beneath it. Behind it: a minimal Coefficient Set shipped as bundled data — the EcoLogits energy-per-token regression constants, server non-GPU power, PUE, and amortized embodied hardware — each constant paired with its citation (source name, year, link). One Scenario Recipe (Model Class + output-token count) defined as data. A single pure function `computeFootprint(scenario) → Footprint` computes Energy min/central/max, with the Uncertainty Band driven by the Model Class's active-parameter range (MoE activation 10–30%). The card is a thin rendering layer over this function. Full-stack, location-based boundary per ADR 0001 — no other boundary anywhere.

**Blocked by:** 01 — Scaffold deployable static site.

**Status:** done

- [x] The card renders the Scenario's bold central Energy (Wh) with min–max band beneath
- [x] Golden-value test: a 500-token frontier Scenario's energy is same-order as, and above, Epoch AI's ~0.3 Wh GPU-only figure (per the deliberate full-stack boundary)
- [x] Invariant test: min ≤ central ≤ max; Energy scales monotonically with output tokens
- [x] Every Coefficient record carries a citation; the Scenario Recipe is data, not code
- [x] All math tests attach at the `computeFootprint` seam — no tests of internal helpers

---

# 03 — Carbon derived from Energy

**What to build:** The Scenario card also shows Carbon (gCO₂e) alongside Energy — bold central number with its own min–max Uncertainty Band — derived from Energy via a location-based grid-intensity Coefficient (world default 0.458 kgCO₂e/kWh, per SCI/ISO 21031; market-based accounting rejected per ADR 0001). The grid-intensity constant joins the Coefficient Set with its citation, and min/central/max propagate through unchanged.

**Blocked by:** 02 — First tracer Scenario.

**Status:** done

- [x] Card shows Carbon (gCO₂e) central number with min–max band, alongside Energy
- [x] Golden-value test: a ~1,000-token frontier-class Scenario lands in the ~1–3 gCO₂e range _(re-anchored from 5–11 g: that ballpark assumed GPT-4-original scale ~176–528B active; our frontier recipe is modern GPT-4.1/4o scale per EcoLogits proxies, anchored instead to Mistral's peer-reviewed LCA — 1.14 g per 400-token response on 123B dense — which contradicts ticket 02's Epoch-anchored energy test otherwise)_
- [x] Invariant test: Carbon scales linearly with grid intensity; min ≤ central ≤ max holds for Carbon
- [x] Grid-intensity Coefficient carries its citation in the Coefficient Set

---

# 04 — Equivalents on the card

**What to build:** Beneath the Footprint numbers, the visitor sees the Scenario translated into familiar Equivalents ("3 minutes of TV", "40 m of driving"). Each Equivalent converts from Energy or Carbon via a published conversion Coefficient (TV wattage, gCO₂e per meter of driving, …) added to the Coefficient Set with its citation. `computeFootprint` returns the list of Equivalents as part of the Footprint, so the UI stays a thin rendering layer.

**Blocked by:** 03 — Carbon derived from Energy.

**Status:** ready-for-agent

- [ ] Card renders at least two Equivalents (one Energy-based, one Carbon-based)
- [ ] Equivalents come out of `computeFootprint`, not computed in components
- [ ] Each conversion Coefficient carries its citation
- [ ] Behavior test at the seam: a given Scenario returns the expected Equivalent values

---

# 05 — Methodology Notes on every figure

**What to build:** Hovering any displayed figure — Energy, Carbon, band endpoints, each Equivalent — reveals a Methodology Note with its citation and boundary statement; the same note is reachable by keyboard focus and touch tap, never hover-only. Notes render from the same Coefficient record the math uses, so a number and its citation can never drift apart.

**Blocked by:** 03 — Carbon derived from Energy; 04 — Equivalents on the card.

**Status:** ready-for-agent

- [ ] Every displayed figure reveals a Methodology Note on hover
- [ ] Notes are reachable via keyboard focus and touch tap (accessibility story #15)
- [ ] Notes render from the same Coefficient records used by `computeFootprint`
- [ ] Invariant test: every displayed figure carries a Methodology Note reference

---

# 06 — Full Scenario set with instant card switching

**What to build:** The visitor picks among the full preset Scenario set — spanning light to heavy activities ("ask ChatGPT a question", "plan a trip", "an afternoon of agent coding") across Model Classes (frontier, mid, small/mini — named by tier, never vendor) — and the Footprint updates immediately on switch, so activities can be compared. All Scenario Recipes and Model Class parameter ranges are data (EcoLogits closed-model proxies); adding or tuning a Scenario needs no logic changes. Preset cards only — no knobs, no freeform token entry.

**Blocked by:** 02 — First tracer Scenario.

**Status:** ready-for-agent

- [ ] Scenario cards span light → heavy activities across all three Model Classes
- [ ] Clicking a card updates the displayed Footprint immediately
- [ ] Invariant test: smaller Model Classes never exceed larger ones on the same Recipe
- [ ] UI smoke test: clicking a Scenario card renders that Scenario's computed central numbers
- [ ] Adding a new Scenario is a data-only change

---

# 07 — "Why our numbers are higher" explainer panel

**What to build:** A skeptical visitor finds a Methodology-Note-style panel explaining why the page's figures are ~5–30× higher than provider-marketing numbers (Altman's 0.34 Wh, Google's 0.03 gCO₂e): a deliberate full-stack, location-based boundary choice per ADR 0001, applied uniformly to every Scenario, with training-phase emissions excluded and stated as such.

**Blocked by:** 05 — Methodology Notes on every figure.

**Status:** ready-for-agent

- [ ] Panel explains the full-stack, location-based boundary and names the ~5–30× gap explicitly
- [ ] References ADR 0001 and cites the compared provider figures
- [ ] States that training-phase emissions are excluded (as industry-wide per-query figures do)
- [ ] Reachable by keyboard and touch, consistent with Methodology Note interaction

---

# 08 — Green nature theme and mobile polish

**What to build:** The page gets its public face: the green, nature-themed visual design per the README, with the bold-central-number / small-band display hierarchy, readable and usable on a phone so visitors can share it in conversation. Plain SCSS per web-config conventions — no CSS Modules, no Tailwind.

**Blocked by:** 05 — Methodology Notes on every figure; 06 — Full Scenario set.

**Status:** ready-for-agent

- [ ] Green nature-themed design applied across the page
- [ ] Layout readable and fully usable on a phone-sized viewport
- [ ] Bold central numbers with small Uncertainty Bands beneath, per README design
- [ ] Stylelint passes; no CSS Modules or Tailwind introduced
