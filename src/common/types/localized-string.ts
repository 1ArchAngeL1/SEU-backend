export type LocaleKey = 'ka' | 'en';

export function pickLocalized(
  enValue: string | undefined | null,
  kaValue: string | undefined | null,
  locale: LocaleKey = 'en',
): string {
  if (locale === 'ka') return kaValue ?? enValue ?? '';
  return enValue ?? kaValue ?? '';
}
