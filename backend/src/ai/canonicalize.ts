// Deterministic canonical JSON with sorted keys so equivalent inputs hash the same.

export const canonicalize = (value: unknown): string => {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value ?? null);
  }
  if (Array.isArray(value)) {
    return '[' + value.map(canonicalize).join(',') + ']';
  }
  const keys = Object.keys(value as Record<string, unknown>).sort();
  const parts = keys.map((k) => JSON.stringify(k) + ':' + canonicalize((value as Record<string, unknown>)[k]));
  return '{' + parts.join(',') + '}';
};

export const canonicalizeText = (text: string): string => text.trim().toLowerCase().replace(/\s+/g, ' ');
