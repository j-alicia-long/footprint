# AI Carbon Footprint

A green, nature-themed web page that answers: **"What does an everyday AI activity actually cost the planet?"**

Pick a preset Scenario card — *ask ChatGPT a question*, *an afternoon of agent coding*, *plan a trip* — and see its estimated **Energy (Wh)** and **Carbon (gCO₂e)** footprint, translated into familiar Equivalents like minutes of TV or meters of driving. Every number carries an uncertainty band and a hover Methodology Note citing its source.

## Status

Planning — domain model complete, build not started.

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
