import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PaginationDto, SortDto } from '@/common/dto/request-body.dto';
import { PaginatedResult } from '@/common/interfaces/paginated-result.interface';
import { MailService } from '@/mail/mail.service';
import { renderContactNotification } from './contact-notification.template';
import { CreateContactDto } from './dto/create-contact.dto';
import { ContactFilterDto } from './dto/search-contacts.dto';
import { UpdateContactStatusDto } from './dto/update-contact-status.dto';
import { Contact, ContactDocument } from './schemas/contact.schema';

/**
 * Requests sent from an apartment page carry the unit they came from — the
 * admin panel lists it, so reads hand back enough of the unit (and its project
 * name) to label the row without a second round trip.
 */
const UNIT_POPULATE = {
  path: 'unit',
  select: 'unitNumber block floorNumber building project',
  populate: [{ path: 'project', select: 'nameEn nameKa' }],
};

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
    // The notification labels the apartment exactly like the admin list does,
    // which needs the unit and its project name.
    await contact.populate(UNIT_POPULATE);

    // Fire-and-forget: the request is already stored, and a mail server that is
    // slow or down must not fail — or hold up — the visitor's submission.
    void this.notifyNewContact(contact);

    return contact;
  }

  /** Emails the sales inbox that someone left their number. Never throws. */
  private async notifyNewContact(contact: ContactDocument): Promise<void> {
    try {
      const siteUrl = this.config.get<string>('PUBLIC_SITE_URL')?.trim();
      const mail = renderContactNotification(contact, {
        siteUrl,
        adminUrl:
          this.config.get<string>('ADMIN_CONTACTS_URL')?.trim() ||
          (siteUrl ? `${siteUrl.replace(/\/+$/, '')}/en/admin/contacts` : undefined),
        timeZone: this.config.get<string>('MAIL_TIMEZONE')?.trim(),
      });

      await this.mail.send({
        // Falls back to MAIL_TO inside the mail service when unset.
        to: this.config.get<string>('CONTACT_NOTIFICATION_TO')?.trim(),
        ...mail,
      });
    } catch (err) {
      this.logger.error(
        `Contact notification failed for '${contact.id}': ${(err as Error).message}`,
      );
    }
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
      this.contactModel
        .find(query)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .populate(UNIT_POPULATE)
        .exec(),
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
    const contact = await this.contactModel
      .findById(id)
      .populate(UNIT_POPULATE)
      .exec();
    if (!contact) throw new NotFoundException(`Contact '${id}' not found`);
    return contact;
  }

  async updateStatus(id: string, dto: UpdateContactStatusDto): Promise<ContactDocument> {
    const updated = await this.contactModel
      .findByIdAndUpdate(id, { status: dto.status }, { new: true, runValidators: true })
      .populate(UNIT_POPULATE)
      .exec();
    if (!updated) throw new NotFoundException(`Contact '${id}' not found`);
    return updated;
  }
}
