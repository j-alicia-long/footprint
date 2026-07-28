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
