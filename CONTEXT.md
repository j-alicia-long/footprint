# AI Carbon Footprint

A public, nature-themed page where a visitor picks a preset everyday AI scenario and sees its estimated environmental footprint, translated into familiar equivalent actions. Pure reference math — no personal data.

## Language

Visitor-facing copy is written for a reader with no ML or energy background: everyday meaning first, technical term second, and every acronym spelled out at first use in a section — e.g. Power Usage Effectiveness (PUE).

**Scenario**:
A preset card describing a familiar AI activity ("ask ChatGPT a question", "an afternoon of agent coding", "plan a trip"). Hypothetical, not measured.
_Avoid_: session (reserved for a real recorded run in the companion ai-cost-tracker project), action, task, query

**Scenario Recipe**:
The token math behind a Scenario: a Model Class plus an output-token count (e.g. 40 turns × 2,000 tokens). The token count is visible and adjustable via the main-page slider (presets set it, visitors may drag it); the Model Class stays preset-driven.
_Avoid_: parameters, config

**Model Class**:
A size tier of model the Scenario assumes (frontier ~GPT-4-class, mid, small/mini). Named by tier, not vendor, since closed-model sizes are guesses.
_Avoid_: model name, LLM

**Footprint**:
The computed physical estimate for a Scenario: Energy (Wh) as the base, Carbon (gCO₂e) derived from it. Always carries an Uncertainty Band.
_Avoid_: cost (reserved for ai-cost-tracker's dollar/token meanings), impact (vague)

**Energy**:
Watt-hours the servers drew to run the Scenario. The objective, location-independent base metric; everything else is a multiplier on it.

**Carbon**:
Grams of CO₂-equivalent, derived from Energy via grid intensity (location-based, per SCI). The metric that powers most Equivalents.
_Avoid_: emissions (unqualified), CO2 (imprecise — it's CO₂e)

**Uncertainty Band**:
The honest min–max range around a Footprint's central estimate, driven mostly by unknown closed-model parameter counts. Displayed small beneath the bold central number.
_Avoid_: error bars, confidence interval (implies statistics this isn't)

**Equivalent**:
A familiar real-world action with the same footprint as the Scenario ("3 minutes of TV", "40 m of driving"). Each converts from Energy or Carbon via a published Coefficient.
_Avoid_: comparison, analogy

**Coefficient Set**:
The bundled published constants the page ships with: energy-per-token regression (EcoLogits fit on ML.ENERGY data), PUE, grid intensity, and Equivalent conversion factors — each with its citation.
_Avoid_: magic numbers, config data

**Methodology Note**:
The citation and boundary statement behind a number, revealed on hover. Every displayed figure has one.
_Avoid_: footnote (unqualified), disclaimer
