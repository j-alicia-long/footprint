import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { App } from "./app";

test("visitor sees the AI Carbon Footprint page", () => {
  render(<App />);
  expect(
    screen.getByRole("heading", { name: "AI Carbon Footprint" }),
  ).toBeInTheDocument();
});
