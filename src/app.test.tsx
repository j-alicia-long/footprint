import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { App } from "./app";
import { withBase } from "./base-path";
import {
  sliderPositionToTokens,
  tokensToSliderPosition,
} from "./components/token-slider";
import { computeFootprint } from "./footprint/compute-footprint";
import { scenarios } from "./footprint/scenarios";

test("visitor sees the AI Carbon Footprint page", () => {
  render(<App path="/" />);
  expect(
    screen.getByRole("heading", { name: "AI Carbon Footprint" }),
  ).toBeInTheDocument();
});

test("visitor picks among the full preset Scenario set", () => {
  render(<App path="/" />);
  for (const scenario of scenarios) {
    expect(
      screen.getByRole("button", { name: scenario.title }),
    ).toBeInTheDocument();
  }
});

test("skeptical visitor finds one plain sentence linking to the boundary explainer on Sources", () => {
  render(<App path="/" />);
  // The long-form "why our numbers are higher" panel lives on /sources
  // (ticket 11); the main page keeps a single sentence linking to it.
  const link = screen.getByRole("link", {
    name: /see our sources & methodology/i,
  });
  expect(link).toHaveAttribute("href", withBase("/sources#boundary"));
  expect(screen.queryByText(/0\.34 Wh/)).not.toBeInTheDocument();
});

test("direct load of /sources renders the Sources page (SPA fallback route)", () => {
  render(<App path="/sources" />);
  expect(
    screen.getByRole("heading", { name: /sources & methodology/i }),
  ).toBeInTheDocument();
});

test("UI smoke: clicking a Scenario card renders that Scenario's computed central numbers", async () => {
  const user = userEvent.setup();
  render(<App path="/" />);

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
  render(<App path="/" />);

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
  render(<App path="/" />);

  const sliderPosition = 42;
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
  render(<App path="/" />);
  expect(screen.getByRole("slider")).toHaveAccessibleName(
    /word-pieces AI models read and write/i,
  );
});
