import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { App } from "./app";
import {
  sliderPositionToTokens,
  tokensToSliderPosition,
} from "./components/token-slider";
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
  const { energyWh } = computeFootprint(tripScenario);

  expect(
    screen.queryByText(`${energyWh.central.toFixed(1)} Wh`),
  ).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: tripScenario.title }));

  expect(
    screen.getByText(`${energyWh.central.toFixed(1)} Wh`),
  ).toBeInTheDocument();
  // No raw Carbon figure anywhere on the main page (ticket 09)
  expect(screen.queryByText(/gCO₂e/)).not.toBeInTheDocument();
});

test("clicking a preset card sets the slider and Model Class; Footprint updates immediately", async () => {
  const user = userEvent.setup();
  render(<App />);

  const codingScenario = scenarios.find(
    (s) => s.id === "agent-coding-afternoon",
  );
  if (!codingScenario) throw new Error("agent-coding-afternoon missing");
  await user.click(screen.getByRole("button", { name: codingScenario.title }));

  const slider = screen.getByRole("slider");
  expect(slider).toHaveValue(
    String(tokensToSliderPosition(codingScenario.outputTokens)),
  );
  expect(
    screen.getByRole("button", { name: codingScenario.title }),
  ).toHaveAttribute("aria-pressed", "true");

  const { energyWh } = computeFootprint(codingScenario);
  expect(
    screen.getByText(`${energyWh.central.toFixed(1)} Wh`),
  ).toBeInTheDocument();
});

test("dragging the slider recomputes the Footprint and detaches from presets", () => {
  render(<App />);

  const sliderPosition = 700;
  fireEvent.change(screen.getByRole("slider"), {
    target: { value: String(sliderPosition) },
  });

  // Detached: no preset card highlighted
  for (const scenario of scenarios) {
    expect(
      screen.getByRole("button", { name: scenario.title }),
    ).toHaveAttribute("aria-pressed", "false");
  }

  // Slider value flows through the computeFootprint seam unchanged
  const outputTokens = sliderPositionToTokens(sliderPosition);
  const { energyWh } = computeFootprint({
    id: "custom",
    title: "custom",
    modelClass: scenarios[0].modelClass,
    outputTokens,
  });
  expect(
    screen.getByText(outputTokens.toLocaleString("en-US")),
  ).toBeInTheDocument();
  expect(
    screen.getByText(`${energyWh.central.toFixed(1)} Wh`),
  ).toBeInTheDocument();
});

test("slider label explains 'token' in plain language", () => {
  render(<App />);
  expect(screen.getByRole("slider")).toHaveAccessibleName(
    /word-pieces AI models read and write/i,
  );
});
