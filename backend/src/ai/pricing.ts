// Per-1K-token USD pricing. Update as provider prices change.
// Unknown models fall back to zero so metering still records the call.

interface ModelPrice {
  inputPer1k: number;
  outputPer1k: number;
}

const PRICES: Record<string, ModelPrice> = {
  'gpt-4o': { inputPer1k: 0.0025, outputPer1k: 0.01 },
  'gpt-4o-mini': { inputPer1k: 0.00015, outputPer1k: 0.0006 },
};

export const computeCostUsd = (model: string, promptTokens: number, completionTokens: number): number => {
  const price = PRICES[model];
  if (!price) return 0;
  const inputCost = (promptTokens / 1000) * price.inputPer1k;
  const outputCost = (completionTokens / 1000) * price.outputPer1k;
  return Number((inputCost + outputCost).toFixed(6));
};
