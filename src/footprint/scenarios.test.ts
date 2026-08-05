import { describe, expect, test } from "vitest";
import { computeFootprint } from "./compute-footprint";
import { modelClasses, scenarios, type ModelClass } from "./scenarios";

describe("Scenario set", () => {
  test("spans light to heavy activities across all three Model Classes", () => {
    const classesUsed = new Set(scenarios.map((s) => s.modelClass));
    for (const modelClass of Object.keys(modelClasses) as ModelClass[]) {
      expect(classesUsed, `a Scenario uses the ${modelClass} class`).toContain(
        modelClass,
      );
    }

    // Light → heavy: the heaviest Scenario's energy must dwarf the
    // lightest's (an afternoon of agent coding vs. one question).
    const centrals = scenarios.map((s) => computeFootprint(s).energyWh.central);
    expect(Math.max(...centrals)).toBeGreaterThan(Math.min(...centrals) * 10);
  });

  test("invariant: smaller Model Classes never exceed larger ones on the same Recipe", () => {
    const recipe = {
      id: "same-recipe",
      title: "same recipe",
      outputTokens: 1000,
    };
    const ordered: ModelClass[] = ["small", "mid", "frontier"];
    const energies = ordered.map(
      (modelClass) =>
        computeFootprint({ ...recipe, modelClass }).energyWh.central,
    );
    expect(energies[0]).toBeLessThanOrEqual(energies[1]);
    expect(energies[1]).toBeLessThanOrEqual(energies[2]);
  });
});
