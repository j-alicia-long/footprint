import {
  coefficients as bundledCoefficients,
  type Coefficient,
} from "./coefficients";
import { modelClasses, type Scenario } from "./scenarios";

type CoefficientSet = Record<keyof typeof bundledCoefficients, Coefficient>;

// Exact definitional unit conversion, not a published Coefficient
const METERS_PER_MILE = 1609.344;

export type UncertaintyBand = {
  min: number;
  central: number;
  max: number;
};

export type MethodologyNote = {
  /** One plain-language sentence describing what the figure means. */
  summary: string;
  /** Link into the Sources page section with the full math and citations. */
  sourcesHref: string;
  /** The measurement-boundary statement every figure shares (ADR 0001). */
  boundary: string;
  /** The exact Coefficient records the figure's math used. */
  coefficients: Coefficient[];
};

export type Equivalent = {
  id: string;
  label: string;
  /** Which Footprint metric the conversion Coefficient applies to. */
  basis: "energy" | "carbon";
  unit: string;
  amount: UncertaintyBand;
  note: MethodologyNote;
};

export type Footprint = {
  energyWh: UncertaintyBand;
  carbonG: UncertaintyBand;
  energyNote: MethodologyNote;
  carbonNote: MethodologyNote;
  equivalents: Equivalent[];
};

/** Boundary statement shared by every Methodology Note (ADR 0001). */
export const BOUNDARY_STATEMENT =
  "Full-stack, location-based boundary (ADR 0001): GPU + server non-GPU energy × datacenter PUE, carbon via the physical grid mix. Training-phase emissions excluded.";

/**
 * Compute a Scenario's Footprint using the EcoLogits full-stack,
 * location-based model (ADR 0001): GPU energy from the ML.ENERGY-fitted
 * regression, plus server non-GPU energy, times datacenter PUE.
 * The Uncertainty Band comes from the Model Class's active-parameter
 * range (unknown MoE activation, 10-30%).
 */
export const computeFootprint = (
  scenario: Scenario,
  coefficients: CoefficientSet = bundledCoefficients,
): Footprint => {
  const spec = modelClasses[scenario.modelClass];
  const c = coefficients;
  const batch = c.batchSize.value;

  // GPUs needed to hold the model, rounded up to a power of two
  const requiredMemoryGb =
    (1.2 * spec.totalParamsB * c.modelQuantizationBits.value) / 8;
  const gpuCount =
    2 ** Math.ceil(Math.log2(Math.ceil(requiredMemoryGb / c.gpuMemory.value)));

  const energyAt = (activeParamsB: number): number => {
    // Per-GPU energy (Wh) over the whole generation
    const gpuEnergyPerTokenWh =
      c.gpuEnergyAlpha.value *
        Math.exp(c.gpuEnergyBeta.value * batch) *
        activeParamsB +
      c.gpuEnergyGamma.value;
    const gpuEnergyWh = scenario.outputTokens * gpuEnergyPerTokenWh;

    // Generation latency (s) drives server non-GPU energy
    const latencyPerTokenS =
      c.latencyAlpha.value * activeParamsB +
      c.latencyBeta.value * batch +
      c.latencyGamma.value;
    const latencyS = scenario.outputTokens * latencyPerTokenS;
    const serverEnergyWh =
      (latencyS / 3600) *
      (c.serverPower.value * 1000) *
      (gpuCount / c.serverGpuCount.value) *
      (1 / batch);

    return c.datacenterPue.value * (serverEnergyWh + gpuCount * gpuEnergyWh);
  };

  const { min, max } = spec.activeParamsB;
  const energyWh = {
    min: energyAt(min),
    central: energyAt((min + max) / 2),
    max: energyAt(max),
  };

  // Carbon = Energy × location-based grid intensity (kgCO2e/kWh ≡ gCO2e/Wh);
  // min/central/max propagate through unchanged.
  const gWh = c.gridIntensity.value;
  const carbonG = {
    min: energyWh.min * gWh,
    central: energyWh.central * gWh,
    max: energyWh.max * gWh,
  };

  const scaleBand = (
    band: UncertaintyBand,
    factor: number,
  ): UncertaintyBand => ({
    min: band.min * factor,
    central: band.central * factor,
    max: band.max * factor,
  });

  // Methodology Notes: built from the very Coefficient records the math
  // above used, so a figure and its citation can never drift apart. The
  // summary is the one plain-language sentence the main page shows; the
  // long-form methodology lives on the Sources page (ticket 11).
  const note = (
    summary: string,
    sourcesHref: string,
    usedCoefficients: Coefficient[],
  ): MethodologyNote => ({
    summary,
    sourcesHref,
    boundary: BOUNDARY_STATEMENT,
    coefficients: usedCoefficients,
  });
  const energyCoefficients = [
    c.gpuEnergyAlpha,
    c.gpuEnergyBeta,
    c.gpuEnergyGamma,
    c.latencyAlpha,
    c.latencyBeta,
    c.latencyGamma,
    c.batchSize,
    c.gpuMemory,
    c.modelQuantizationBits,
    c.serverGpuCount,
    c.serverPower,
    c.datacenterPue,
  ];
  const energyNote = note(
    "Electricity the servers drew to generate this answer, counting the whole machine and datacenter overhead — not just the AI chips.",
    "/sources#energy-model",
    energyCoefficients,
  );
  const carbonNote = note(
    "Climate impact of that electricity, based on the world-average power grid where servers actually run.",
    "/sources#carbon",
    [...energyCoefficients, c.gridIntensity],
  );

  // Equivalents: familiar actions with the same Footprint, each converted
  // via a published Coefficient (ticket 04).
  const minutesPerWh = 60 / c.tvPower.value;
  const metersPerG = METERS_PER_MILE / c.carDrivingCarbon.value;
  const equivalents: Equivalent[] = [
    {
      id: "tv-watching",
      label: "watching TV",
      basis: "energy",
      unit: "min",
      amount: scaleBand(energyWh, minutesPerWh),
      note: note(
        "The same electricity as running a typical flat-screen TV for this long.",
        "/sources#equivalents",
        [...energyNote.coefficients, c.tvPower],
      ),
    },
    {
      id: "car-driving",
      label: "driving a car",
      basis: "carbon",
      unit: "m",
      amount: scaleBand(carbonG, metersPerG),
      note: note(
        "The same climate impact as driving an average gasoline car this far.",
        "/sources#equivalents",
        [...carbonNote.coefficients, c.carDrivingCarbon],
      ),
    },
  ];

  return { energyWh, carbonG, energyNote, carbonNote, equivalents };
};
