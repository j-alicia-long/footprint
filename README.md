# AI Carbon Footprint

A green, nature-themed web page that answers: **"What does an everyday AI activity actually cost the planet?"**

Pick a preset Scenario card — _ask ChatGPT a question_, _an afternoon of agent coding_, _plan a trip_ — and see its estimated **Energy (Wh)** and **Carbon (gCO₂e)** footprint, translated into familiar Equivalents like minutes of TV or meters of driving. Every number carries an uncertainty band and a hover Methodology Note citing its source.

## Status

In progress — scaffold and first tracer Scenario built (tickets 01–02 of [`tasks3.md`](tasks3.md)): one card shows Energy (Wh) with its Uncertainty Band, computed by `computeFootprint` from a cited Coefficient Set. Deployment (on Zo) pending.

## Development

```sh
npm install
npm run dev         # local dev server
npm test            # vitest
npm run lint        # ESLint (web-config preset)
npm run lint:styles # Stylelint (web-config preset)
npm run typecheck
npm run build       # static production build in dist/
npm run sync-skills # re-copy web-conventions skill into .github/skills/
```

Pre-commit (husky + lint-staged) runs Prettier + ESLint on staged files, then typecheck and tests.

## Design

- **Metrics:** Energy (Wh) as the objective base; Carbon (gCO₂e) derived from it via location-based grid intensity. No water in v1.
- **Boundary:** full-stack, location-based accounting (EcoLogits methodology, SCI/ISO 21031) — see [ADR 0001](docs/adr/0001-full-stack-location-based-boundary.md). Numbers are deliberately ~5–30× higher than provider-marketing figures.
- **Input:** preset Scenario cards only — no knobs, no freeform token entry.
- **Display:** bold central number, small min–max range beneath, methodology on hover.
- **Stack:** React + Vite static site; no backend, no personal data.

## Docs

- [`CONTEXT.md`](CONTEXT.md) — domain glossary (Scenario, Footprint, Equivalent, Coefficient Set…)
- [`docs/adr/`](docs/adr/) — architecture decision records
- [`research.md`](research.md) — the underlying research: primary sources on LLM energy/carbon/water measurement, per-query figures, tools (EcoLogits, ML.ENERGY), and default coefficients with citations
