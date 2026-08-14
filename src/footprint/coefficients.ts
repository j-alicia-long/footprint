/**
 * The Coefficient Set: every published constant the page's math uses,
 * each paired with its citation. Data, not code — per ticket 02.
 */

export type Citation = {
  source: string;
  year: number;
  url: string;
};

export type Coefficient = {
  id: string;
  description: string;
  value: number;
  unit: string;
  citation: Citation;
};

const ecologitsCitation: Citation = {
  source:
    "EcoLogits (GenAI Impact), regression fitted on ML.ENERGY H100 benchmark data",
  year: 2024,
  url: "https://ecologits.ai/latest/methodology/llm_inference/",
};

export const coefficients = {
  gpuEnergyAlpha: {
    id: "gpu-energy-alpha",
    description:
      "Alpha of the GPU energy-per-token regression: Wh/token = alpha * e^(beta * batchSize) * activeParamsB + gamma",
    value: 1.1665273170451914e-6,
    unit: "Wh/token/B-params",
    citation: ecologitsCitation,
  },
  gpuEnergyBeta: {
    id: "gpu-energy-beta",
    description:
      "Beta (batch-size decay) of the GPU energy-per-token regression",
    value: -0.011205921025579175,
    unit: "1/request",
    citation: ecologitsCitation,
  },
  gpuEnergyGamma: {
    id: "gpu-energy-gamma",
    description: "Gamma (intercept) of the GPU energy-per-token regression",
    value: 4.052928146734005e-5,
    unit: "Wh/token",
    citation: ecologitsCitation,
  },
  latencyAlpha: {
    id: "latency-alpha",
    description:
      "Alpha of the generation-latency regression: s/token = alpha * activeParamsB + beta * batchSize + gamma",
    value: 0.0006785088094353663,
    unit: "s/token/B-params",
    citation: ecologitsCitation,
  },
  latencyBeta: {
    id: "latency-beta",
    description: "Beta (batch-size term) of the generation-latency regression",
    value: 0.0003119310311688259,
    unit: "s/token/request",
    citation: ecologitsCitation,
  },
  latencyGamma: {
    id: "latency-gamma",
    description: "Gamma (intercept) of the generation-latency regression",
    value: 0.019473717579473387,
    unit: "s/token",
    citation: ecologitsCitation,
  },
  batchSize: {
    id: "batch-size",
    description:
      "Default number of requests a serving node handles concurrently",
    value: 64,
    unit: "requests",
    citation: ecologitsCitation,
  },
  gpuMemory: {
    id: "gpu-memory",
    description: "Memory of a single H100-class GPU",
    value: 80,
    unit: "GB",
    citation: ecologitsCitation,
  },
  modelQuantizationBits: {
    id: "model-quantization-bits",
    description:
      "Bits per weight assumed when computing model memory footprint",
    value: 16,
    unit: "bits",
    citation: ecologitsCitation,
  },
  serverGpuCount: {
    id: "server-gpu-count",
    description: "GPUs per serving node",
    value: 8,
    unit: "GPUs",
    citation: ecologitsCitation,
  },
  serverPower: {
    id: "server-power",
    description: "Non-GPU power draw of an 8-GPU serving node (CPU, RAM, fans)",
    value: 1.2,
    unit: "kW",
    citation: ecologitsCitation,
  },
  datacenterPue: {
    id: "datacenter-pue",
    description:
      "Power Usage Effectiveness: datacenter overhead multiplier (cooling, power conversion)",
    value: 1.2,
    unit: "ratio",
    citation: {
      source: "EcoLogits provider PUE table (Azure datacenters)",
      year: 2024,
      url: "https://ecologits.ai/latest/methodology/llm_inference/",
    },
  },
  gpuEmbodiedCarbon: {
    id: "gpu-embodied-carbon",
    description:
      "Manufacturing carbon of one H100 GPU, amortized over the hardware lifespan",
    value: 273,
    unit: "kgCO2e",
    citation: {
      source: "ADEME / Lees-Perasso et al., via EcoLogits",
      year: 2023,
      url: "https://ecologits.ai/latest/methodology/llm_inference/",
    },
  },
  serverEmbodiedCarbon: {
    id: "server-embodied-carbon",
    description: "Manufacturing carbon of one 8-GPU server (excluding GPUs)",
    value: 5700,
    unit: "kgCO2e",
    citation: {
      source: "BoaviztAPI, via EcoLogits",
      year: 2024,
      url: "https://ecologits.ai/latest/methodology/llm_inference/",
    },
  },
  gridIntensity: {
    id: "grid-intensity",
    description:
      "World-average location-based grid carbon intensity (SCI/ISO 21031; market-based accounting rejected per ADR 0001)",
    value: 0.458,
    unit: "kgCO2e/kWh",
    citation: {
      source:
        "EcoLogits electricity_mixes.json WOR (Our World in Data / Ember)",
      year: 2024,
      url: "https://ecologits.ai/latest/methodology/llm_inference/",
    },
  },
  hardwareLifespan: {
    id: "hardware-lifespan",
    description:
      "Assumed server lifespan over which embodied carbon is amortized",
    value: 3 * 365 * 24 * 60 * 60,
    unit: "s",
    citation: ecologitsCitation,
  },
  tvPower: {
    id: "tv-power",
    description:
      "Typical power draw of a modern flat-screen TV, used for the Energy-based TV-watching Equivalent",
    value: 100,
    unit: "W",
    citation: {
      source:
        "U.S. Department of Energy, Estimating Appliance and Home Electronic Energy Use (flat-screen TV range 60\u2013150 W)",
      year: 2023,
      url: "https://www.energy.gov/energysaver/estimating-appliance-and-home-electronic-energy-use",
    },
  },
  carDrivingCarbon: {
    id: "car-driving-carbon",
    description:
      "Tailpipe carbon of an average U.S. passenger vehicle per mile driven, used for the Carbon-based driving Equivalent",
    value: 400,
    unit: "gCO2e/mile",
    citation: {
      source:
        "U.S. EPA, Greenhouse Gas Emissions from a Typical Passenger Vehicle",
      year: 2023,
      url: "https://www.epa.gov/greenvehicles/greenhouse-gas-emissions-typical-passenger-vehicle",
    },
  },
} as const satisfies Record<string, Coefficient>;
