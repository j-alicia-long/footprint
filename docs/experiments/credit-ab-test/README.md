# A/B Test: AI Credit Usage for `/to-tickets`

**Date:** 2026-07-27
**Question:** How does session context affect credit consumption when running the `/to-tickets` skill against the same spec?

## Setup

Common inputs across all arms:

- Spec with user stories: [#1 — Spec: AI Carbon Footprint v1](https://github.com/j-alicia-long/ai-carbon-footprint/issues/1), generated via the `/to-spec` skill (which itself built on domain-modeling research + ADR docs from an earlier session).
- Task: run the `/to-tickets` skill to turn the spec into tickets in a markdown file.

| Arm | Session | Prompt | Credits |
|-----|---------|--------|---------|
| 1 | **Same session** that generated the spec | "Use /to-tickets skill and put into tasks.md" | **170** (255 → 425) |
| 2 | **Fresh session**, minimal prompt | "Use /to-tickets skill and put into tasks2.md" | **120** |
| 3 | **Fresh session**, spec URL included | "Turn this spec https://github.com/j-alicia-long/ai-carbon-footprint/issues/1 into tickets with the /to-ticket skill and put into tasks3.md" | **124** |

## Results

### Credit usage

- **Arm 1 was ~40% more expensive** (170 vs 120/124). Carrying the full spec-generation conversation means every subsequent model call re-processes that accumulated context (input tokens scale with conversation length), even though the needed information already lives in the issue and repo docs.
- **Arms 2 and 3 were nearly identical** (120 vs 124). Explicitly linking the spec didn't add meaningful cost — and didn't save any either, since the minimal-prompt session evidently found the spec on its own (via the repo/issue).

### Output quality (see artifacts below)

| | Arm 1 ([tasks-arm1.md](./tasks-arm1.md)) | Arm 2 ([tasks-arm2.md](./tasks-arm2.md)) | Arm 3 ([tasks-arm3.md](./tasks-arm3.md)) |
|--|--|--|--|
| Tickets | 7 | 7 | 8 |
| Length | 100 lines | 108 lines | 128 lines |
| Scaffold ticket | ✅ Detailed web-config conventions (pinned `v0.1.1`, skills sync, husky) | ❌ Bare "Vite + React + test runner"; misses web-config entirely | ✅ Most detailed — web-config, deploy-to-public-URL in slice 1 |
| Deploy pipeline | ❌ Not covered | ✅ Dedicated ticket 02 | ✅ Folded into ticket 01 |
| Specific constants/citations | Some (EcoLogits, gCO₂e golden range) | ✅ Regression constants inline (α, β, γ, batch) | ✅ Most: constants, 0.458 kgCO₂e/kWh, Epoch AI/Altman/Google comparisons |
| "Why higher" explainer | Folded into final polish ticket | Folded into Methodology Notes ticket | ✅ Own dedicated ticket 07 |
| Dependency structure | Linear-ish; 03 blocks most things | Widest frontier (02–05 all unblocked after 01) | Balanced; 02 fans out to 03 and 06 |

**Takeaways on quality:**

- **Arm 3 produced the richest output** — most tickets, most spec-faithful detail (exact coefficients, named provider comparisons, story references), and a dedicated skeptic-explainer ticket. The explicit spec link seems to have anchored it to read #1 thoroughly.
- **Arm 1's extra context bought some conventions knowledge** (web-config setup details carried from the earlier conversation) but **not a better ticket breakdown** — it's the shortest output and missed deployment entirely.
- **Arm 2 was the cheapest but weakest on project conventions** — it never mentions `@j-alicia-long/web-config` or the skills-sync setup, presumably because nothing pointed it at those docs. It did, however, uniquely call out a deploy pipeline as its own slice.

## Conclusion

**Fresh session + explicit pointers to source docs (Arm 3) is the sweet spot:** ~same cost as the minimal prompt, ~40% cheaper than session reuse, and the highest-fidelity output. Long-running sessions accumulate context that inflates cost without proportionate quality gains; a fresh session recovers the needed context cheaply *if* the prompt links it. The residual risk of fresh sessions is missing implicit conventions (Arm 2's web-config gap) — mitigate by linking conventions docs, not by reusing sessions.

## Artifacts

Outputs copied verbatim from each arm's worktree (original branches were never pushed):

- [tasks-arm1.md](./tasks-arm1.md) — Arm 1 (`tasks.md`, branch `j-alicia-long-redesigned-disco`)
- [tasks-arm2.md](./tasks-arm2.md) — Arm 2 (`tasks2.md`, uncommitted, branch `j-alicia-long-laughing-barnacle`)
- [tasks-arm3.md](./tasks-arm3.md) — Arm 3 (`tasks3.md`, branch `j-alicia-long-spec-to-tickets`)
