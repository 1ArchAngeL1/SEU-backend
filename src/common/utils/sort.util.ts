/**
 * Parse a `sort` query string into a Mongoose sort object.
 * Supports `-` prefix for descending and comma-separated fields. e.g. `-createdAt,name`
 */
export function parseSort(sort?: string): Record<string, 1 | -1> | undefined {
  if (!sort) return undefined;
  const result: Record<string, 1 | -1> = {};
  for (const raw of sort
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)) {
    if (raw.startsWith('-')) result[raw.slice(1)] = -1;
    else result[raw] = 1;
  }
  return Object.keys(result).length ? result : undefined;
}
