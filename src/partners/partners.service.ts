import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PaginationDto, SortDto } from '@/common/dto/request-body.dto';
import { PaginatedResult } from '@/common/interfaces/paginated-result.interface';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { PartnerFilterDto } from './dto/search-partners.dto';
import { Partner, PartnerDocument } from './schemas/partner.schema';

@Injectable()
export class PartnersService {
  constructor(
    @InjectModel(Partner.name) private readonly partnerModel: Model<PartnerDocument>,
  ) {}

  async create(dto: CreatePartnerDto): Promise<PartnerDocument> {
    return this.partnerModel.create(dto);
  }

  async findAll(
    filter?: PartnerFilterDto,
    pagination?: PaginationDto,
    sort?: SortDto[],
  ): Promise<PaginatedResult<PartnerDocument>> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (filter?.q) {
      query.name = { $regex: filter.q, $options: 'i' };
    }

    const sortBy =
      sort && sort.length
        ? sort.reduce<Record<string, 1 | -1>>(
            (acc, s) => ({ ...acc, [s.field]: s.direction === 'desc' ? -1 : 1 }),
            {},
          )
        : { createdAt: -1 as -1 };

    const [data, total] = await Promise.all([
      this.partnerModel.find(query).sort(sortBy).skip(skip).limit(limit).exec(),
      this.partnerModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: string): Promise<PartnerDocument> {
    const partner = await this.partnerModel.findById(id).exec();
    if (!partner) throw new NotFoundException(`Partner '${id}' not found`);
    return partner;
  }

  async update(id: string, dto: UpdatePartnerDto): Promise<PartnerDocument> {
    const updated = await this.partnerModel
      .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .exec();
    if (!updated) throw new NotFoundException(`Partner '${id}' not found`);
    return updated;
  }

  async remove(id: string): Promise<{ deleted: true; id: string }> {
    const deleted = await this.partnerModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException(`Partner '${id}' not found`);
    return { deleted: true, id };
  }
}
