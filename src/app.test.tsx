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

test("skeptical visitor finds the 'why our numbers are higher' explainer panel", async () => {
  const user = userEvent.setup();
  render(<App />);

  const trigger = screen.getByRole("button", {
    name: /why are these numbers higher/i,
  });
  expect(trigger).toHaveAttribute("aria-expanded", "false");

  await user.click(trigger);
  expect(trigger).toHaveAttribute("aria-expanded", "true");

  const panel = screen.getByRole("note", { name: /why are these numbers/i });
  // Names the gap and the deliberate boundary choice, per ADR 0001
  expect(panel).toHaveTextContent(/5–30×/);
  expect(panel).toHaveTextContent(/full-stack, location-based/i);
  expect(panel).toHaveTextContent(/ADR 0001/);
  // Cites the compared provider figures
  expect(panel).toHaveTextContent(/0\.34 Wh/);
  expect(panel).toHaveTextContent(/0\.03 gCO₂e/);
  // States that training-phase emissions are excluded
  expect(panel).toHaveTextContent(/training/i);
  expect(panel).toHaveTextContent(/excluded/i);
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
