import { render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { coefficients } from "../footprint/coefficients";
import { SourcesPage } from "./sources-page";

test("renders every Coefficient in the set with its value and citation link (data-driven)", () => {
  render(<SourcesPage />);

  for (const coefficient of Object.values(coefficients)) {
    expect(screen.getByText(coefficient.description)).toBeInTheDocument();
    const citation = screen.getAllByRole("link", {
      name: `${coefficient.citation.source} (${coefficient.citation.year})`,
    })[0];
    expect(citation).toHaveAttribute("href", coefficient.citation.url);
  }
});

test("groups constants into readable sections: energy model, carbon, hardware, equivalents", () => {
  render(<SourcesPage />);

  for (const [id, name] of [
    ["energy-model", /how we estimate energy/i],
    ["carbon", /how energy becomes carbon/i],
    ["hardware", /the hardware behind the numbers/i],
    ["equivalents", /how equivalents are converted/i],
  ] as const) {
    const section = screen.getByRole("region", { name });
    // Anchor target for the main page's "see sources" links
    expect(section).toHaveAttribute("id", id);
  }
});

test("the boundary explainer ('why our numbers are higher') lives here", () => {
  render(<SourcesPage />);

  const panel = screen.getByRole("region", {
    name: /why our numbers are higher/i,
  });
  // Names the gap and the deliberate boundary choice, per ADR 0001
  expect(panel).toHaveTextContent(/5–30×/);
  expect(panel).toHaveTextContent(/full-stack, location-based/i);
  expect(within(panel).getByRole("link", { name: "ADR 0001" })).toBeVisible();
  // Cites the compared provider figures
  expect(panel).toHaveTextContent(/0\.34 Wh/);
  expect(panel).toHaveTextContent(/0\.03 gCO₂e/);
  // States that training-phase emissions are excluded
  expect(panel).toHaveTextContent(/training/i);
  expect(panel).toHaveTextContent(/excluded/i);
});

test("acronyms are spelled out at first use in each section", () => {
  render(<SourcesPage />);

  expect(
    screen.getAllByText(/Power Usage Effectiveness \(PUE\)/).length,
  ).toBeGreaterThanOrEqual(1);
  expect(screen.getByText(/Mixture of Experts \(MoE\)/)).toBeInTheDocument();
  expect(
    screen.getByText(/Software Carbon Intensity \(SCI\)/),
  ).toBeInTheDocument();
});
