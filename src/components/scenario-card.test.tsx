import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

test("card shows no raw Carbon figure — Energy is the sole headline number (ticket 09)", () => {
  render(<ScenarioCard scenario={scenario} />);
  // carbonG stays in the Footprint math; the visitor meets carbon only
  // through the friendly driving Equivalent, never as a raw gram count.
  expect(computeFootprint(scenario).carbonG.central).toBeGreaterThan(0);
  expect(screen.queryByText(/gCO₂e/)).not.toBeInTheDocument();
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

test("invariant: every displayed figure is a Methodology Note trigger (keyboard- and touch-reachable button)", () => {
  render(<ScenarioCard scenario={scenario} />);
  // Energy central + band, and each Equivalent
  const { equivalents } = computeFootprint(scenario);
  const triggers = screen.getAllByRole("button", {
    name: /methodology for/i,
  });
  expect(triggers).toHaveLength(2 + equivalents.length);
  for (const trigger of triggers) {
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  }
});

test("tapping a figure reveals its plain-language Methodology Note linking to Sources", async () => {
  const user = userEvent.setup();
  render(<ScenarioCard scenario={scenario} />);
  const { energyNote } = computeFootprint(scenario);

  const energyTrigger = screen.getByRole("button", {
    name: /methodology for central energy/i,
  });
  await user.click(energyTrigger);

  expect(energyTrigger).toHaveAttribute("aria-expanded", "true");
  const note = screen.getByRole("note");
  // The note shows the same one-sentence summary computeFootprint built
  expect(note).toHaveTextContent(energyNote.summary);
  // Long-form methodology and citations live on the Sources page
  expect(
    screen.getByRole("link", { name: /see sources & methodology/i }),
  ).toHaveAttribute("href", energyNote.sourcesHref);
});
