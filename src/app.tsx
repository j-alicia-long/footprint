import { useState } from "react";
import { ScenarioCard } from "./components/scenario-card";
import { scenarios } from "./footprint/scenarios";

export const App = () => {
  const [selected, setSelected] = useState(scenarios[0]);
  return (
    <main className="app">
      <h1>AI Carbon Footprint</h1>
      <p>What does everyday AI use actually cost the planet?</p>
      <nav aria-label="Scenarios" className="scenario-picker">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            type="button"
            className="scenario-picker-button"
            aria-pressed={scenario.id === selected.id}
            onClick={() => setSelected(scenario)}
          >
            {scenario.title}
          </button>
        ))}
      </nav>
      <ScenarioCard scenario={selected} />
    </main>
  );
};
