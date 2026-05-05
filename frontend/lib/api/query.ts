export type QueryValue = string | number | boolean | null | undefined;

export function queryString(params: object): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params) as Array<[string, QueryValue]>) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }

  const value = search.toString();
  return value ? `?${value}` : "";
}

export function withQuery(path: string, params: object): string {
  return `${path}${queryString(params)}`;
}
