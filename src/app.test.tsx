import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { App } from "./app";
import { computeFootprint } from "./footprint/compute-footprint";
import { scenarios } from "./footprint/scenarios";

test("visitor sees the AI Carbon Footprint page", () => {
  render(<App />);
  expect(
    screen.getByRole("heading", { name: "AI Carbon Footprint" }),
  ).toBeInTheDocument();
});

test("visitor picks among the full preset Scenario set", () => {
  render(<App />);
  for (const scenario of scenarios) {
    expect(
      screen.getByRole("button", { name: scenario.title }),
    ).toBeInTheDocument();
  }
});

test("UI smoke: clicking a Scenario card renders that Scenario's computed central numbers", async () => {
  const user = userEvent.setup();
  render(<App />);

  // Not the default selection, so its numbers appear only after the click
  const tripScenario = scenarios.find((s) => s.id === "plan-a-trip");
  if (!tripScenario) throw new Error("plan-a-trip Scenario missing");
  const { energyWh, carbonG } = computeFootprint(tripScenario);

  expect(
    screen.queryByText(`${energyWh.central.toFixed(1)} Wh`),
  ).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: tripScenario.title }));

  expect(
    screen.getByText(`${energyWh.central.toFixed(1)} Wh`),
  ).toBeInTheDocument();
  expect(
    screen.getByText(`${carbonG.central.toFixed(1)} gCO₂e`),
  ).toBeInTheDocument();
});
