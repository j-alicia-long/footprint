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

export type Equivalent = {
  id: string;
  label: string;
  /** Which Footprint metric the conversion Coefficient applies to. */
  basis: "energy" | "carbon";
  unit: string;
  amount: UncertaintyBand;
};

export type Footprint = {
  energyWh: UncertaintyBand;
  carbonG: UncertaintyBand;
  equivalents: Equivalent[];
};

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
    },
    {
      id: "car-driving",
      label: "driving a car",
      basis: "carbon",
      unit: "m",
      amount: scaleBand(carbonG, metersPerG),
    },
  ];

  return { energyWh, carbonG, equivalents };
};
