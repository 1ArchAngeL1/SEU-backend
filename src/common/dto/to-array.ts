import { Transform } from 'class-transformer';

/**
 * Comma-separated query-string lists.
 *
 * A multi-select filter has to travel as one query param — `?bedrooms=1,4`
 * means "exactly 1 **or** exactly 4", which a numeric range cannot express.
 * Express also hands over `?x=1&x=4` as an array, so both spellings are
 * accepted and collapsed to the same list.
 *
 * Anything unparseable is left in place so `@IsInt({ each: true })` /
 * `@IsEnum(..., { each: true })` still reject it instead of it silently
 * becoming `NaN` and matching nothing.
 */
const split = (value: unknown): unknown[] => {
  const raw = Array.isArray(value) ? value : [value];
  return raw
    .flatMap((v) => (typeof v === 'string' ? v.split(',') : [v]))
    .map((v) => (typeof v === 'string' ? v.trim() : v))
    .filter((v) => v !== '' && v !== undefined && v !== null);
};

/** `?types=living,parking` → `['living', 'parking']`. */
export const ToStringArray = () =>
  Transform(({ value }) => {
    if (value === undefined) return undefined;
    const items = split(value);
    return items.length ? items : undefined;
  });

/** `?bedrooms=1,4` → `[1, 4]`. Non-numeric entries survive as-is to be rejected. */
export const ToNumberArray = () =>
  Transform(({ value }) => {
    if (value === undefined) return undefined;
    const items = split(value).map((v) => {
      const n = Number(v);
      return typeof v === 'number' || Number.isFinite(n) ? n : v;
    });
    return items.length ? items : undefined;
  });
