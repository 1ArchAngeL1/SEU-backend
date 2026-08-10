import { Transform } from 'class-transformer';

/**
 * Query-string booleans.
 *
 * `@Type(() => Boolean)` is wrong for query params: everything arrives as a
 * string and `Boolean('false')` is `true`. This reads the usual textual forms
 * and leaves anything else untouched so `@IsBoolean()` still rejects garbage.
 */
export const ToBoolean = () =>
  Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value;
  });
