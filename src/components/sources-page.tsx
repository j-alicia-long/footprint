import { type Coefficient, coefficients as c } from "../footprint/coefficients";
import { modelClasses } from "../footprint/scenarios";

type SourcesSection = {
  id: string;
  title: string;
  paragraphs: string[];
  coefficients: Coefficient[];
};

/**
 * The deep methodology content behind every figure (ticket 11), rendered
 * from the same Coefficient Set records the math uses — citations are
 * data-driven, never hand-duplicated prose. Writing convention: every
 * acronym is spelled out at first use in each section, everyday meaning
 * first, technical term second.
 */
const sections: SourcesSection[] = [
  {
    id: "energy-model",
    title: "How we estimate Energy",
    paragraphs: [
      "Energy is the watt-hours the servers drew to generate an answer. We replicate the EcoLogits methodology: a regression (a formula fitted to measured data) from the ML.ENERGY benchmark predicts how much electricity one Graphics Processing Unit — GPU, the specialized chip that runs AI models — uses per generated token, based on how big the model is.",
      "On top of the chips themselves we add the rest of the machine (processor, memory, fans) and the building around it, via Power Usage Effectiveness (PUE) — the industry ratio of total datacenter electricity to the electricity that reaches the computers.",
      "Closed-model sizes are unpublished, so each Model Class uses a published size proxy, and the Uncertainty Band spans how much of a Mixture of Experts (MoE) model — one that activates only a fraction of itself per token — is actually working (10–30%).",
    ],
    coefficients: [
      c.gpuEnergyAlpha,
      c.gpuEnergyBeta,
      c.gpuEnergyGamma,
      c.latencyAlpha,
      c.latencyBeta,
      c.latencyGamma,
      c.batchSize,
      c.serverPower,
      c.serverGpuCount,
      c.datacenterPue,
    ],
  },
  {
    id: "carbon",
    title: "How Energy becomes Carbon",
    paragraphs: [
      "Carbon is the climate impact of that electricity, in grams of carbon-dioxide equivalent (gCO₂e) — a unit that folds all greenhouse gases into one number. We multiply Energy by the world-average grid intensity: how much carbon the physical power grid emits per kilowatt-hour, following the Software Carbon Intensity (SCI) specification, standardized as ISO 21031.",
      "This is location-based accounting — the actual grid mix where servers run — not the renewable-energy certificates providers buy, which is why our Carbon runs higher than market-based marketing figures.",
    ],
    coefficients: [c.gridIntensity],
  },
  {
    id: "hardware",
    title: "The hardware behind the numbers",
    paragraphs: [
      "Making a server also costs carbon before it ever answers a question — this is embodied carbon, the manufacturing footprint amortized (spread out) over the machine's working life. The constants below describe the Graphics Processing Unit (GPU) hardware our estimates assume: how much memory each chip has, how model weights are stored, and what manufacturing cost we spread across each answer.",
    ],
    coefficients: [
      c.gpuMemory,
      c.modelQuantizationBits,
      c.gpuEmbodiedCarbon,
      c.serverEmbodiedCarbon,
      c.hardwareLifespan,
    ],
  },
  {
    id: "equivalents",
    title: "How Equivalents are converted",
    paragraphs: [
      "Equivalents translate a Footprint into familiar actions with the same physical cost. Energy-based ones divide by a published appliance power draw (a typical flat-screen TV); Carbon-based ones divide by a published emission rate (an average gasoline car per distance driven).",
    ],
    coefficients: [c.tvPower, c.carDrivingCarbon],
  },
];

const formatValue = (coefficient: Coefficient): string => {
  const { value, unit } = coefficient;
  const number =
    Math.abs(value) < 0.001
      ? value.toExponential(3)
      : value.toLocaleString("en-US");
  return `${number} ${unit}`;
};

const modelClassProxy = Object.values(modelClasses)[0].citation;

export const SourcesPage = () => (
  <main className="app sources">
    <a className="sources-back" href="/">
      ← Back to the footprint page
    </a>
    <h1>Sources &amp; methodology</h1>
    <p>
      Every number on the main page is computed from the published constants
      below — each one carries its citation, so any figure can be traced to a
      primary source.
    </p>

    <section
      id="boundary"
      className="sources-section"
      aria-labelledby="boundary-title"
    >
      <h2 id="boundary-title" className="sources-section-title">
        Why our numbers are higher than the ones AI companies quote
      </h2>
      <p>
        Our figures run ~5–30× above provider-marketing numbers — Sam
        Altman&rsquo;s &ldquo;0.34 Wh per ChatGPT query&rdquo; (blog, 2025) and
        Google&rsquo;s &ldquo;0.03 gCO₂e per Gemini prompt&rdquo; (technical
        report, 2025) — deliberately.
      </p>
      <p>
        Every number here uses one fixed{" "}
        <strong>full-stack, location-based</strong> boundary (
        <a href="https://github.com/j-alicia-long/ai-carbon-footprint/blob/main/docs/adr/0001-full-stack-location-based-boundary.md">
          ADR 0001
        </a>
        ): GPU energy plus the server around it plus datacenter overhead — Power
        Usage Effectiveness (PUE) — with carbon from the physical grid mix where
        servers run, not renewable-certificate accounting. Boundary choice alone
        swings published figures ~95×, so we never mix boundaries across
        Scenarios.
      </p>
      <p>
        Like nearly all published per-query figures (including the provider
        numbers above), training-phase emissions are excluded.
      </p>
    </section>

    {sections.map((section) => (
      <section
        key={section.id}
        id={section.id}
        className="sources-section"
        aria-labelledby={`${section.id}-title`}
      >
        <h2 id={`${section.id}-title`} className="sources-section-title">
          {section.title}
        </h2>
        {section.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 32)}>{paragraph}</p>
        ))}
        <ul className="sources-coefficients">
          {section.coefficients.map((coefficient) => (
            <li key={coefficient.id} className="sources-coefficient">
              <span className="sources-coefficient-description">
                {coefficient.description}
              </span>
              <span className="sources-coefficient-value">
                {formatValue(coefficient)}
              </span>
              <a
                className="sources-coefficient-citation"
                href={coefficient.citation.url}
              >
                {`${coefficient.citation.source} (${coefficient.citation.year})`}
              </a>
            </li>
          ))}
        </ul>
      </section>
    ))}

    <section
      id="model-classes"
      className="sources-section"
      aria-labelledby="model-classes-title"
    >
      <h2 id="model-classes-title" className="sources-section-title">
        Model Class size proxies
      </h2>
      <p>
        Closed-model parameter counts are guesses, so each Model Class
        (frontier, mid, small/mini — named by tier, never vendor) takes its
        assumed size from{" "}
        <a href={modelClassProxy.url}>
          {`${modelClassProxy.source} (${modelClassProxy.year})`}
        </a>
        .
      </p>
    </section>
  </main>
);
