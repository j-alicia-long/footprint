import { computeFootprint } from "../footprint/compute-footprint";
import type { Scenario } from "../footprint/scenarios";

const formatWh = (value: number) => `${value.toFixed(1)} Wh`;

/** Thin rendering layer over computeFootprint — no math in components. */
export const ScenarioCard = ({ scenario }: { scenario: Scenario }) => {
  const { energyWh, carbonG, equivalents } = computeFootprint(scenario);
  return (
    <article className="scenario-card">
      <h2 className="scenario-card-title">{scenario.title}</h2>
      <p className="scenario-card-energy">
        <strong className="scenario-card-central">
          {formatWh(energyWh.central)}
        </strong>
        <span className="scenario-card-band">
          {`${energyWh.min.toFixed(1)} – ${energyWh.max.toFixed(1)} Wh`}
        </span>
      </p>
      <p className="scenario-card-carbon">
        <strong className="scenario-card-central">
          {`${carbonG.central.toFixed(1)} gCO₂e`}
        </strong>
        <span className="scenario-card-band">
          {`${carbonG.min.toFixed(1)} – ${carbonG.max.toFixed(1)} gCO₂e`}
        </span>
      </p>
      <ul className="scenario-card-equivalents">
        {equivalents.map((equivalent) => (
          <li key={equivalent.id} className="scenario-card-equivalent">
            {`${equivalent.amount.central.toFixed(1)} ${equivalent.unit} of ${equivalent.label}`}
          </li>
        ))}
      </ul>
    </article>
  );
};
