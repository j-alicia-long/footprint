import { describe, expect, test } from "vitest";
import { coefficients } from "./coefficients";
import { computeFootprint } from "./compute-footprint";
import { modelClasses, type Scenario } from "./scenarios";

// A 500-output-token frontier-class Scenario, mirroring Epoch AI's
// GPT-4o estimate setup (epoch.ai Gradient Updates, Feb 2025).
const frontier500: Scenario = {
  id: "test-frontier-500",
  title: "500-token frontier response",
  modelClass: "frontier",
  outputTokens: 500,
};

describe("computeFootprint — Energy", () => {
  test("golden value: 500-token frontier Scenario is same-order as, and above, Epoch AI's ~0.3 Wh GPU-only figure", () => {
    const footprint = computeFootprint(frontier500);
    // Full-stack boundary (ADR 0001) must land above the GPU-only 0.3 Wh
    // but within the same order of magnitude (< 3 Wh).
    expect(footprint.energyWh.central).toBeGreaterThan(0.3);
    expect(footprint.energyWh.central).toBeLessThan(3);
  });

  test("invariant: Uncertainty Band brackets the central estimate (min ≤ central ≤ max, min < max)", () => {
    const { energyWh } = computeFootprint(frontier500);
    expect(energyWh.min).toBeLessThanOrEqual(energyWh.central);
    expect(energyWh.central).toBeLessThanOrEqual(energyWh.max);
    // The band must be real — closed-model parameter counts are guesses
    expect(energyWh.min).toBeLessThan(energyWh.max);
  });

  test("invariant: Energy scales monotonically with output tokens", () => {
    const shorter = computeFootprint({ ...frontier500, outputTokens: 100 });
    const longer = computeFootprint({ ...frontier500, outputTokens: 2000 });
    expect(shorter.energyWh.central).toBeLessThan(frontier500Energy());
    expect(frontier500Energy()).toBeLessThan(longer.energyWh.central);
  });
});

const frontier500Energy = () => computeFootprint(frontier500).energyWh.central;

describe("computeFootprint — Carbon", () => {
  test("golden value: a ~1,000-token frontier Scenario lands near Mistral's LCA anchor (~1–3 gCO₂e)", () => {
    // Anchor: Mistral Large 2 LCA (peer-reviewed, Jul 2025) measured
    // 1.14 gCO₂e per 400-token response on a 123B dense model —
    // ~1–3 g per 1,000 frontier-class tokens at world grid intensity.
    const { carbonG } = computeFootprint({
      ...frontier500,
      outputTokens: 1000,
    });
    expect(carbonG.central).toBeGreaterThan(1);
    expect(carbonG.central).toBeLessThan(3);
  });

  test("invariant: min ≤ central ≤ max holds for Carbon", () => {
    const { carbonG } = computeFootprint(frontier500);
    expect(carbonG.min).toBeLessThanOrEqual(carbonG.central);
    expect(carbonG.central).toBeLessThanOrEqual(carbonG.max);
    expect(carbonG.min).toBeLessThan(carbonG.max);
  });

  test("invariant: Carbon scales linearly with grid intensity", () => {
    const base = computeFootprint(frontier500);
    const doubled = computeFootprint(frontier500, {
      ...coefficients,
      gridIntensity: {
        ...coefficients.gridIntensity,
        value: coefficients.gridIntensity.value * 2,
      },
    });
    expect(doubled.carbonG.central).toBeCloseTo(base.carbonG.central * 2, 10);
    // Energy is upstream of grid intensity and must not change
    expect(doubled.energyWh.central).toBe(base.energyWh.central);
  });
});

describe("computeFootprint — Equivalents", () => {
  test("behavior: returns an Energy-based TV Equivalent (100 W TV runs 0.6 min per Wh)", () => {
    const { energyWh, equivalents } = computeFootprint(frontier500);
    const tv = equivalents.find((e) => e.id === "tv-watching");

    expect(tv).toBeDefined();
    expect(tv?.basis).toBe("energy");
    expect(tv?.unit).toBe("min");
    // Worked example: a 100 W TV draws 1 Wh in 60/100 = 0.6 minutes,
    // so minutes of TV = Wh × 0.6 at every band point.
    expect(tv?.amount.central).toBeCloseTo(energyWh.central * 0.6, 10);
    expect(tv?.amount.min).toBeCloseTo(energyWh.min * 0.6, 10);
    expect(tv?.amount.max).toBeCloseTo(energyWh.max * 0.6, 10);
  });

  test("behavior: returns a Carbon-based driving Equivalent (EPA 400 gCO₂e/mile → 4.02336 m per gCO₂e)", () => {
    const { carbonG, equivalents } = computeFootprint(frontier500);
    const driving = equivalents.find((e) => e.id === "car-driving");

    expect(driving).toBeDefined();
    expect(driving?.basis).toBe("carbon");
    expect(driving?.unit).toBe("m");
    // Worked example: 400 gCO₂e per mile (1,609.344 m) means
    // 1 gCO₂e ≡ 1609.344 / 400 = 4.02336 m of driving.
    expect(driving?.amount.central).toBeCloseTo(carbonG.central * 4.02336, 10);
    expect(driving?.amount.min).toBeCloseTo(carbonG.min * 4.02336, 10);
    expect(driving?.amount.max).toBeCloseTo(carbonG.max * 4.02336, 10);
  });

  test("invariant: every Equivalent's band brackets its central value", () => {
    const { equivalents } = computeFootprint(frontier500);
    expect(equivalents.length).toBeGreaterThanOrEqual(2);
    for (const equivalent of equivalents) {
      expect(equivalent.amount.min, equivalent.id).toBeLessThanOrEqual(
        equivalent.amount.central,
      );
      expect(equivalent.amount.central, equivalent.id).toBeLessThanOrEqual(
        equivalent.amount.max,
      );
    }
  });
});

describe("Coefficient Set", () => {
  test("every Coefficient record carries a citation with source, year, and link", () => {
    for (const coefficient of Object.values(coefficients)) {
      const { citation } = coefficient;
      expect(citation.source, coefficient.id).toBeTruthy();
      expect(citation.year, coefficient.id).toBeGreaterThan(2000);
      expect(citation.url, coefficient.id).toMatch(/^https:\/\//);
    }
  });

  test("every Model Class spec carries a citation", () => {
    for (const [name, spec] of Object.entries(modelClasses)) {
      expect(spec.citation.source, name).toBeTruthy();
      expect(spec.citation.url, name).toMatch(/^https:\/\//);
    }
  });
});
