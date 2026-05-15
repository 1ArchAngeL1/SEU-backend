import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PaginationDto, SortDto } from '@/common/dto/request-body.dto';
import { PaginatedResult } from '@/common/interfaces/paginated-result.interface';
import { CreateContactDto } from './dto/create-contact.dto';
import { ContactFilterDto } from './dto/search-contacts.dto';
import { UpdateContactStatusDto } from './dto/update-contact-status.dto';
import { Contact, ContactDocument } from './schemas/contact.schema';

@Injectable()
export class ContactsService {
  constructor(
    @InjectModel(Contact.name) private readonly contactModel: Model<ContactDocument>,
  ) {}

  async create(dto: CreateContactDto): Promise<ContactDocument> {
    return this.contactModel.create(dto);
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
