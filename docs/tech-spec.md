# Tech Spec — Footprint Computation

How the page turns a Scenario into displayed numbers. Everything here is
implemented in `src/footprint/` and validated by tests at the
`computeFootprint` seam (`src/footprint/compute-footprint.test.ts`).

## Boundary

Full-stack, **location-based** accounting per
[ADR 0001](adr/0001-full-stack-location-based-boundary.md): GPU energy +
server non-GPU energy + datacenter overhead (PUE), carbon via the physical
grid mix where servers run. Market-based accounting (renewable-certificate
math) is rejected. Training-phase emissions are excluded, as in nearly all
published per-query figures. This is why our numbers run ~5–30× above
provider-marketing figures — deliberately.

## The computation seam

One pure function:

```ts
computeFootprint(scenario: Scenario, coefficients?: CoefficientSet): Footprint
```

- `Scenario` carries its hidden Recipe: a Model Class + output-token count.
  Recipes are data (`src/footprint/scenarios.ts`), never code.
- `coefficients` defaults to the bundled Coefficient Set
  (`src/footprint/coefficients.ts`). It is injectable so invariants (e.g.
  carbon linearity in grid intensity) can be tested at the seam without
  reaching into internals.
- `Footprint` returns `energyWh` and `carbonG`, each an Uncertainty Band
  `{ min, central, max }`.
- The React UI is a thin rendering layer over this function; components do
  no math (enforced by testing only at the seam).

## Energy model (EcoLogits methodology)

We replicate EcoLogits' bottom-up model (`ecologits/impacts/llm.py`),
calibrated on ML.ENERGY's measured H100 benchmark data. For a Scenario with
`T` output tokens on a Model Class with `A` billion _active_ parameters and
`P` billion total parameters:

**1. GPU count.** The model must fit in GPU memory (H100 = 80 GB, 16-bit
weights, 1.2× overhead), rounded up to a power of two:

```
memoryGB = 1.2 × P × 16 / 8
gpuCount = 2^⌈log₂⌈memoryGB / 80⌉⌉
```

**2. GPU energy** from the fitted regression, per token per GPU, at batch
size B = 64:

```
E_gpu(Wh/token) = α·e^(β·B)·A + γ        α=1.17e-6, β=−0.0112, γ=4.05e-5
gpuEnergyWh = T × E_gpu × gpuCount
```

**3. Server (non-GPU) energy** — CPU/RAM/fans of the 1.2 kW 8-GPU node,
prorated by GPUs used and shared across the batch. Generation latency comes
from a companion regression:

```
latency(s) = T × (6.79e-4·A + 3.12e-4·B + 0.0195)
serverEnergyWh = (latency/3600) × 1200 × (gpuCount/8) / B
```

**4. Datacenter overhead.** Total energy = `PUE × (gpuEnergyWh + serverEnergyWh)`
with PUE = 1.2 (EcoLogits Azure figure).

## Uncertainty Band

Closed-model parameter counts are guesses. Each Model Class ships an
active-parameter **range** reflecting unknown MoE activation (10–30% of
total parameters, per EcoLogits proxies). The band is the energy model
evaluated at the range endpoints; the central estimate uses the midpoint:

| Model Class | Total params | Active params (min–max) | Proxy basis                   |
| ----------- | ------------ | ----------------------- | ----------------------------- |
| frontier    | 352B         | 35–106B                 | GPT-4.1-scale MoE (EcoLogits) |
| mid         | 110B         | 11–33B                  | mid-tier MoE                  |
| small       | 25B          | 2.5–7.5B                | small/mini class              |

Displayed as a bold central number with the small min–max band beneath.

## Carbon

Derived from Energy via the location-based world-average grid intensity:

```
carbonG = energyWh × 0.458        (0.458 kgCO₂e/kWh ≡ 0.458 gCO₂e/Wh)
```

min/central/max propagate through unchanged. Source: EcoLogits
`electricity_mixes.json` WOR (Our World in Data / Ember), per SCI/ISO 21031.

Embodied-hardware constants (H100: 273 kgCO₂e; 8-GPU server: 5,700 kgCO₂e,
3-year amortization) ship in the Coefficient Set with citations but are
**not yet folded into carbonG** — at realistic latencies they add well under
1 g per request and no ticket has required them yet.

## Coefficient Set

Every constant lives in `src/footprint/coefficients.ts` as a record
`{ id, description, value, unit, citation }`, where `citation` is
`{ source, year, url }`. An invariant test asserts every Coefficient and
every Model Class spec carries a citation, so a displayed number and its
source can never drift apart (this also feeds ticket 05's Methodology
Notes).

## Golden-value anchors (and one re-anchoring)

Tests pin the math to independent published figures:

- **Energy:** a 500-token frontier Scenario must land **above** Epoch AI's
  ~0.3 Wh GPU-only estimate for GPT-4o but within the same order of
  magnitude (< 3 Wh). Actual: **1.3 Wh central** (0.98–1.71).
- **Carbon:** a ~1,000-token frontier Scenario must land in **~1–3 gCO₂e**,
  anchored to Mistral's peer-reviewed LCA (1.14 gCO₂e per 400-token
  response on a 123B dense model). Actual: **~1.2 g central**.

The carbon anchor was **re-anchored from the spec's original 5–11 g**
(2026-07-28). That ballpark assumed a GPT-4-_original_-scale frontier
(1.76T total / 176–528B active, ~64 GPUs), which yields ~16 Wh per 500
tokens — two orders of magnitude above Epoch's figure, contradicting the
energy anchor. No single frontier recipe satisfies both: 5 g of carbon at
0.458 g/Wh requires ≥ ~10 Wh per 1,000 tokens, i.e. ≥ 5 Wh per 500. We keep
the modern (GPT-4.1/4o-era) frontier recipe and the Mistral-anchored carbon
range. Both golden tests now hold with one recipe.

## Invariants under test

At the seam only — no tests of internal helpers:

- `min ≤ central ≤ max` for Energy and Carbon; band is non-degenerate
- Energy scales monotonically with output tokens
- Carbon scales linearly with grid intensity (via injected Coefficient
  Set); Energy is unaffected by grid intensity
- Every Coefficient and Model Class carries a citation

## Deployment

Static Vite build, no backend. `scripts/deploy-zo.sh` builds `dist/` and
syncs it file-by-file to the Zo site `footprint`
(`zo:/home/workspace/footprint/dist/`) over the Zo MCP API (`write_file`);
the Zo production server is a plain static server over that folder with SPA
fallback. This repo is the source of truth. Live:
https://footprint-jlong.zocomputer.io
