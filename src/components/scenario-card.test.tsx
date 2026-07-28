import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { computeFootprint } from "../footprint/compute-footprint";
import { scenarios } from "../footprint/scenarios";
import { ScenarioCard } from "./scenario-card";

const scenario = scenarios[0];

test("card shows the Scenario's bold central Energy (Wh) with min–max Uncertainty Band beneath", () => {
  render(<ScenarioCard scenario={scenario} />);
  const { energyWh } = computeFootprint(scenario);

  expect(screen.getByText(scenario.title)).toBeInTheDocument();
  // Central number, rendered to one decimal (e.g. "1.3 Wh")
  expect(
    screen.getByText(`${energyWh.central.toFixed(1)} Wh`),
  ).toBeInTheDocument();
  // Uncertainty Band beneath: "0.9 – 1.7 Wh"
  expect(
    screen.getByText(
      `${energyWh.min.toFixed(1)} – ${energyWh.max.toFixed(1)} Wh`,
    ),
  ).toBeInTheDocument();
});

test("card shows Carbon (gCO₂e) central number with min–max band, alongside Energy", () => {
  render(<ScenarioCard scenario={scenario} />);
  const { carbonG } = computeFootprint(scenario);

  expect(
    screen.getByText(`${carbonG.central.toFixed(1)} gCO₂e`),
  ).toBeInTheDocument();
  expect(
    screen.getByText(
      `${carbonG.min.toFixed(1)} – ${carbonG.max.toFixed(1)} gCO₂e`,
    ),
  ).toBeInTheDocument();
});

test("card renders the Scenario's Equivalents (Energy-based TV and Carbon-based driving) from computeFootprint", () => {
  render(<ScenarioCard scenario={scenario} />);
  const { equivalents } = computeFootprint(scenario);
  expect(equivalents.length).toBeGreaterThanOrEqual(2);

  // e.g. "0.8 min of watching TV" and "2.5 m of driving a car"
  for (const equivalent of equivalents) {
    expect(
      screen.getByText(
        `${equivalent.amount.central.toFixed(1)} ${equivalent.unit} of ${equivalent.label}`,
      ),
    ).toBeInTheDocument();
  }
});
