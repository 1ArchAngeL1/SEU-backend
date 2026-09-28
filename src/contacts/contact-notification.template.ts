import { ContactDocument } from './schemas/contact.schema';

export interface ContactNotificationLinks {
  /** Public site root, e.g. https://seudevelopment.grena.ge */
  siteUrl?: string;
  /** Admin contact-requests screen, linked at the bottom of the mail. */
  adminUrl?: string;
  /** IANA zone the timestamp is printed in. */
  timeZone?: string;
}

export interface RenderedMail {
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

/** One label/value pair — the same columns the admin list shows. */
interface Row {
  label: string;
  value: string;
  href?: string;
}

const EMPTY = '—';

/**
 * Builds the notification a new contact request sends to the sales inbox.
 *
 * It carries exactly what `/admin/contacts` shows for the row — name, phone,
 * email, the apartment it was sent from, date and status — so whoever reads the
 * mail and whoever opens the panel see the same thing.
 */
export function renderContactNotification(
  contact: ContactDocument,
  links: ContactNotificationLinks = {},
): RenderedMail {
  const name = contact.name?.trim();
  const phone = contact.phone?.trim() ?? '';
  const email = contact.email?.trim();
  const apartment = apartmentOf(contact, links.siteUrl);
  const createdAt = formatDate(
    (contact as unknown as { createdAt?: Date }).createdAt,
    links.timeZone,
  );

  const rows: Row[] = [
    { label: 'Name', value: name || EMPTY },
    { label: 'Phone', value: phone || EMPTY, href: phone ? `tel:${phone.replace(/\s/g, '')}` : undefined },
    { label: 'Email', value: email || EMPTY, href: email ? `mailto:${email}` : undefined },
    { label: 'Apartment', value: apartment?.label ?? EMPTY, href: apartment?.href },
    { label: 'Date', value: createdAt },
    { label: 'Status', value: contact.status === 'closed' ? 'Closed' : 'Open' },
  ];

  const who = name || phone || 'a website visitor';
  const subject = apartment
    ? `New contact request — ${who} · ${apartment.label}`
    : `New contact request — ${who}`;

  return {
    subject,
    text: renderText(rows, links.adminUrl),
    html: renderHtml(rows, links.adminUrl),
    replyTo: email || undefined,
  };
}

/**
 * The apartment the request came from. Requests sent from a unit page carry the
 * unit (reads populate it with the project name); the generic contact and
 * landing forms carry nothing, and a request whose unit was deleted since keeps
 * only the bare id.
 */
function apartmentOf(
  contact: ContactDocument,
  siteUrl?: string,
): { label: string; href?: string } | null {
  const unit = contact.unit as unknown;
  if (!unit) return null;

  const id = unitId(unit);
  const href = id && siteUrl ? `${trimSlash(siteUrl)}/en/search/${id}` : undefined;

  if (!isPopulatedUnit(unit)) return { label: 'Apartment', href };

  const project = unit.project;
  const projectName =
    project && typeof project === 'object'
      ? ((project as { nameEn?: string; nameKa?: string }).nameEn ??
        (project as { nameEn?: string; nameKa?: string }).nameKa ??
        '')
      : '';

  const parts = [
    projectName,
    unit.block && `Block ${unit.block}`,
    unit.floorNumber != null && `Fl. ${unit.floorNumber}`,
    unit.unitNumber && `#${unit.unitNumber}`,
  ].filter(Boolean) as string[];

  return { label: parts.join(' · ') || 'Apartment', href };
}

function isPopulatedUnit(
  unit: unknown,
): unit is {
  unitNumber?: string;
  block?: string;
  floorNumber?: number;
  project?: unknown;
} {
  return (
    typeof unit === 'object' &&
    unit !== null &&
    ('unitNumber' in unit || 'block' in unit || 'floorNumber' in unit)
  );
}

function unitId(unit: unknown): string | undefined {
  if (typeof unit === 'string') return unit;
  if (typeof unit === 'object' && unit !== null) {
    const withId = unit as { id?: unknown; _id?: unknown };
    const raw = withId.id ?? withId._id;
    if (raw) return String(raw);
  }
  return undefined;
}

/** Matches the admin list's `en-GB` stamp, printed in the company's zone. */
function formatDate(date?: Date, timeZone?: string): string {
  if (!date) return EMPTY;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timeZone || 'Asia/Tbilisi',
  }).format(date);
}

function renderText(rows: Row[], adminUrl?: string): string {
  const lines = [
    'A visitor left their contact details on the SEU Development website.',
    '',
    ...rows.map((row) => `${row.label}: ${row.value}`),
  ];
  if (adminUrl) {
    lines.push('', `Open in the admin panel: ${adminUrl}`);
  }
  return lines.join('\n');
}

function renderHtml(rows: Row[], adminUrl?: string): string {
  const cells = rows
    .map(
      (row) => `
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #eae5dc;font:500 13px/1.4 Arial,Helvetica,sans-serif;color:#8a857c;text-transform:uppercase;letter-spacing:.04em;width:130px;vertical-align:top;">${escapeHtml(row.label)}</td>
              <td style="padding:10px 0;border-bottom:1px solid #eae5dc;font:400 16px/1.4 Arial,Helvetica,sans-serif;color:#0D141D;">${renderValue(row)}</td>
            </tr>`,
    )
    .join('');

  const footer = adminUrl
    ? `
          <tr>
            <td style="padding:24px 32px 32px;">
              <a href="${escapeAttr(adminUrl)}" style="display:inline-block;padding:12px 22px;background:#0D141D;color:#F4F0E9;font:600 14px/1 Arial,Helvetica,sans-serif;text-decoration:none;border-radius:8px;">Open in the admin panel</a>
            </td>
          </tr>`
    : '';

  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#F4F0E9;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;">
      <tr>
        <td style="padding:24px 32px;background:#0D141D;">
          <div style="font:600 12px/1 Arial,Helvetica,sans-serif;color:#A19C92;text-transform:uppercase;letter-spacing:.12em;">SEU Development</div>
          <div style="margin-top:8px;font:400 22px/1.3 Georgia,'Times New Roman',serif;color:#F4F0E9;">New contact request</div>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 32px 8px;font:400 15px/1.5 Arial,Helvetica,sans-serif;color:#4a4a4a;">
          A visitor left their contact details on the website.
        </td>
      </tr>
      <tr>
        <td style="padding:8px 32px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${cells}
          </table>
        </td>
      </tr>${footer}
    </table>
  </body>
</html>`;
}

function renderValue(row: Row): string {
  const value = escapeHtml(row.value);
  if (!row.href || row.value === EMPTY) return value;
  return `<a href="${escapeAttr(row.href)}" style="color:#0D141D;text-decoration:underline;">${value}</a>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Hrefs are built from stored data, but a visitor's email lands in mailto:. */
function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/[\r\n]/g, '');
}

function trimSlash(value: string): string {
  return value.replace(/\/+$/, '');
}
