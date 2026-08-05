/**
 * Scenario Recipes and Model Classes — all data, no logic.
 * Model Class parameter ranges follow EcoLogits closed-model proxies;
 * the active-parameter range reflects unknown MoE activation (10-30%).
 */

export type ModelClass = "frontier" | "mid" | "small";

export type Scenario = {
  id: string;
  title: string;
  modelClass: ModelClass;
  outputTokens: number;
};

export type ModelClassSpec = {
  totalParamsB: number;
  activeParamsB: { min: number; max: number };
  citation: { source: string; year: number; url: string };
};

const ecologitsProxies = {
  source: "EcoLogits closed-model proxies (models.json + methodology)",
  year: 2024,
  url: "https://ecologits.ai/latest/methodology/proxy/",
};

export const modelClasses: Record<ModelClass, ModelClassSpec> = {
  // GPT-4.1-scale MoE: ~352B total, 10-30% activation
  frontier: {
    totalParamsB: 352,
    activeParamsB: { min: 35, max: 106 },
    citation: ecologitsProxies,
  },
  // Mid-tier MoE (~110B total)
  mid: {
    totalParamsB: 110,
    activeParamsB: { min: 11, max: 33 },
    citation: ecologitsProxies,
  },
  // Small/mini dense-equivalent (~25B total)
  small: {
    totalParamsB: 25,
    activeParamsB: { min: 2.5, max: 7.5 },
    citation: ecologitsProxies,
  },
};

export const scenarios: Scenario[] = [
  {
    id: "ask-chatgpt",
    title: "Ask ChatGPT a question",
    modelClass: "frontier",
    outputTokens: 500,
  },
  {
    id: "quick-lookup",
    title: "Quick lookup on a mini model",
    modelClass: "small",
    outputTokens: 300,
  },
  {
    id: "summarize-article",
    title: "Summarize a long article",
    modelClass: "mid",
    outputTokens: 800,
  },
  {
    id: "plan-a-trip",
    title: "Plan a trip",
    // ~10 back-and-forth turns × ~600 tokens each
    modelClass: "frontier",
    outputTokens: 6000,
  },
  {
    id: "agent-coding-afternoon",
    title: "An afternoon of agent coding",
    // ~40 agent turns × ~2,000 tokens each
    modelClass: "frontier",
    outputTokens: 80000,
  },
];
