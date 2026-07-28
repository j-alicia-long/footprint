import { ScenarioCard } from "./components/scenario-card";
import { scenarios } from "./footprint/scenarios";

export const App = () => (
  <main className="app">
    <h1>AI Carbon Footprint</h1>
    <p>What does everyday AI use actually cost the planet?</p>
    {scenarios.map((scenario) => (
      <ScenarioCard key={scenario.id} scenario={scenario} />
    ))}
  </main>
);
