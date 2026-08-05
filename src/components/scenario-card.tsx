import { computeFootprint } from "../footprint/compute-footprint";
import type { Scenario } from "../footprint/scenarios";
import { MethodologyFigure } from "./methodology-figure";

const formatWh = (value: number) => `${value.toFixed(1)} Wh`;

/** Thin rendering layer over computeFootprint — no math in components. */
export const ScenarioCard = ({ scenario }: { scenario: Scenario }) => {
  const { energyWh, carbonG, energyNote, carbonNote, equivalents } =
    computeFootprint(scenario);
  return (
    <article className="scenario-card">
      <h2 className="scenario-card-title">{scenario.title}</h2>
      <p className="scenario-card-energy">
        <MethodologyFigure figureLabel="central energy" note={energyNote}>
          <strong className="scenario-card-central">
            {formatWh(energyWh.central)}
          </strong>
        </MethodologyFigure>
        <MethodologyFigure
          figureLabel="energy uncertainty band"
          note={energyNote}
        >
          <span className="scenario-card-band">
            {`${energyWh.min.toFixed(1)} – ${energyWh.max.toFixed(1)} Wh`}
          </span>
        </MethodologyFigure>
      </p>
      <p className="scenario-card-carbon">
        <MethodologyFigure figureLabel="central carbon" note={carbonNote}>
          <strong className="scenario-card-central">
            {`${carbonG.central.toFixed(1)} gCO₂e`}
          </strong>
        </MethodologyFigure>
        <MethodologyFigure
          figureLabel="carbon uncertainty band"
          note={carbonNote}
        >
          <span className="scenario-card-band">
            {`${carbonG.min.toFixed(1)} – ${carbonG.max.toFixed(1)} gCO₂e`}
          </span>
        </MethodologyFigure>
      </p>
      <ul className="scenario-card-equivalents">
        {equivalents.map((equivalent) => (
          <li key={equivalent.id} className="scenario-card-equivalent">
            <MethodologyFigure
              figureLabel={`the ${equivalent.label} equivalent`}
              note={equivalent.note}
            >
              {`${equivalent.amount.central.toFixed(1)} ${equivalent.unit} of ${equivalent.label}`}
            </MethodologyFigure>
          </li>
        ))}
      </ul>
    </article>
  );
};
