export const FOOD_ANALYSIS_SYSTEM = `Return STRICT JSON only for a food description or photo:
{
  "items": [
    {
      "name": string,
      "quantity": string | null,
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "confidence": number
    }
  ],
  "totals": { "calories": number, "protein": number, "carbs": number, "fat": number },
  "confidence": number
}
Rules:
- Be conservative; if unsure, lower the confidence.
- Numbers only, no units in numeric fields.
- totals must equal item sums.
- No prose, markdown, or code fences.`;

export const foodAnalysisUserPrompt = (text?: string): string => {
  if (text && text.trim().length > 0) {
    return `Analyze the following meal description and return the JSON described by the system prompt:\n\n"""${text}"""`;
  }
  return 'Analyze the attached food image and return the JSON described by the system prompt.';
};
