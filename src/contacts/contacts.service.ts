import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PaginationDto, SortDto } from '@/common/dto/request-body.dto';
import { PaginatedResult } from '@/common/interfaces/paginated-result.interface';
import { MailService } from '@/mail/mail.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { ContactFilterDto } from './dto/search-contacts.dto';
import { UpdateContactStatusDto } from './dto/update-contact-status.dto';
import { Contact, ContactDocument } from './schemas/contact.schema';

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escapes visitor-supplied text before it goes into the HTML email body. */
function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ENTITIES[char]);
}

@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);

  constructor(
    @InjectModel(Contact.name) private readonly contactModel: Model<ContactDocument>,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  async create(dto: CreateContactDto): Promise<ContactDocument> {
    const contact = await this.contactModel.create(dto);
    // Awaited so a slow SMTP hop can't outlive the request, but never rethrown:
    // the visitor's submission is already saved and must succeed regardless.
    await this.notify(contact);
    return contact;
  }

  /** Emails the sales inbox that a new call-back request came in. */
  private async notify(contact: ContactDocument): Promise<void> {
    const to = this.config.get<string>('CONTACT_NOTIFY_TO');
    if (!to) {
      this.logger.warn('CONTACT_NOTIFY_TO not set — no notification sent.');
      return;
    }

    const name = contact.name?.trim() || '—';
    const email = contact.email?.trim() || '—';
    const submittedAt = new Date().toLocaleString('en-GB', {
      timeZone: 'Asia/Tbilisi',
    });

    const rows: [string, string][] = [
      ['Phone', contact.phone],
      ['Name', name],
      ['Email', email],
      ['Submitted', `${submittedAt} (Tbilisi)`],
    ];

    await this.mail.send({
      to,
      subject: `New call request — ${contact.phone}`,
      replyTo: contact.email?.trim() || undefined,
      text: rows.map(([label, value]) => `${label}: ${value}`).join('\n'),
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;color:#0D141D">
          <h2 style="margin:0 0 16px">New call request</h2>
          <table cellpadding="6" style="border-collapse:collapse;font-size:15px">
            ${rows
              .map(
                ([label, value]) =>
                  `<tr><td style="color:#A19C92">${label}</td><td><strong>${escapeHtml(value)}</strong></td></tr>`,
              )
              .join('')}
          </table>
        </div>
      `,
    });
  }

  async findAll(
    filter?: ContactFilterDto,
    pagination?: PaginationDto,
    sort?: SortDto[],
  ): Promise<PaginatedResult<ContactDocument>> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (filter?.q) {
      query.$or = [
        { name: { $regex: filter.q, $options: 'i' } },
        { phone: { $regex: filter.q, $options: 'i' } },
        { email: { $regex: filter.q, $options: 'i' } },
      ];
    }
    if (filter?.status) {
      query.status = filter.status;
    }

    const sortBy =
      sort && sort.length
        ? sort.reduce<Record<string, 1 | -1>>(
            (acc, s) => ({ ...acc, [s.field]: s.direction === 'desc' ? -1 : 1 }),
            {},
          )
        : { createdAt: -1 as -1 };

    const [data, total] = await Promise.all([
      this.contactModel.find(query).sort(sortBy).skip(skip).limit(limit).exec(),
      this.contactModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: string): Promise<ContactDocument> {
    const contact = await this.contactModel.findById(id).exec();
    if (!contact) throw new NotFoundException(`Contact '${id}' not found`);
    return contact;
  }

  async updateStatus(id: string, dto: UpdateContactStatusDto): Promise<ContactDocument> {
    const updated = await this.contactModel
      .findByIdAndUpdate(id, { status: dto.status }, { new: true, runValidators: true })
      .exec();
    if (!updated) throw new NotFoundException(`Contact '${id}' not found`);
    return updated;
  }
}
