import { useState } from "react";
import { withBase } from "./base-path";
import { ScenarioCard } from "./components/scenario-card";
import { SourcesPage } from "./components/sources-page";
import { TokenSlider } from "./components/token-slider";
import {
  type ModelClass,
  type Scenario,
  scenarios,
} from "./footprint/scenarios";

const modelClassLabels: Record<ModelClass, string> = {
  frontier: "frontier-class model",
  mid: "mid-class model",
  small: "small/mini model",
};

/**
 * Minimal pathname switch (ticket 11) — no router dependency; the static
 * host's single-page-app fallback serves index.html for /sources, and plain
 * anchor navigation between the two pages is a normal page load, so the
 * path never changes within a mounted App.
 */
export const App = ({ path }: { path: string }) => {
  if (path.startsWith("/sources")) {
    return <SourcesPage />;
  }
  return <FootprintPage />;
};

const FootprintPage = () => {
  // Presets set the slider and Model Class; dragging the slider detaches
  // into a custom state with no card highlighted (ticket 10).
  const [modelClass, setModelClass] = useState<ModelClass>(
    scenarios[0].modelClass,
  );
  const [outputTokens, setOutputTokens] = useState(scenarios[0].outputTokens);
  const [presetId, setPresetId] = useState<string | undefined>(scenarios[0].id);

  const selectPreset = (preset: Scenario) => {
    setModelClass(preset.modelClass);
    setOutputTokens(preset.outputTokens);
    setPresetId(preset.id);
  };
  const changeOutputTokens = (tokens: number) => {
    setOutputTokens(tokens);
    setPresetId(undefined);
  };

  // Ad-hoc Scenario fed to the same computeFootprint seam — no math here
  const selected: Scenario = scenarios.find((s) => s.id === presetId) ?? {
    id: "custom",
    title: `Custom scenario — ${modelClassLabels[modelClass]}`,
    modelClass,
    outputTokens,
  };

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
            aria-pressed={scenario.id === presetId}
            onClick={() => selectPreset(scenario)}
          >
            {scenario.title}
          </button>
        ))}
      </nav>
      <TokenSlider
        outputTokens={outputTokens}
        onOutputTokensChange={changeOutputTokens}
      />
      <ScenarioCard scenario={selected} />
      <p className="sources-link-note">
        Why are these numbers higher than the ones AI companies quote?{" "}
        <a href={withBase("/sources#boundary")}>
          See our sources &amp; methodology.
        </a>
      </p>
    </main>
  );
};
