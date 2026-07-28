import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PaginationDto, SortDto } from '@/common/dto/request-body.dto';
import { PaginatedResult } from '@/common/interfaces/paginated-result.interface';
import { CreateLandingPartnerDto } from './dto/create-landing-partner.dto';
import { UpdateLandingPartnerDto } from './dto/update-landing-partner.dto';
import { LandingPartnerFilterDto } from './dto/search-landing-partners.dto';
import {
  LandingPartner,
  LandingPartnerDocument,
} from './schemas/landing-partner.schema';

@Injectable()
export class LandingPartnersService {
  constructor(
    @InjectModel(LandingPartner.name)
    private readonly landingPartnerModel: Model<LandingPartnerDocument>,
  ) {}

  async create(dto: CreateLandingPartnerDto): Promise<LandingPartnerDocument> {
    return this.landingPartnerModel.create(dto);
  }

  async findAll(
    filter?: LandingPartnerFilterDto,
    pagination?: PaginationDto,
    sort?: SortDto[],
  ): Promise<PaginatedResult<LandingPartnerDocument>> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (filter?.q) {
      query.$or = [
        { nameEn: { $regex: filter.q, $options: 'i' } },
        { nameKa: { $regex: filter.q, $options: 'i' } },
      ];
    }

    const sortBy =
      sort && sort.length
        ? sort.reduce<Record<string, 1 | -1>>(
            (acc, s) => ({ ...acc, [s.field]: s.direction === 'desc' ? -1 : 1 }),
            {},
          )
        : { createdAt: -1 as -1 };

    const [data, total] = await Promise.all([
      this.landingPartnerModel.find(query).sort(sortBy).skip(skip).limit(limit).exec(),
      this.landingPartnerModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: string): Promise<LandingPartnerDocument> {
    const partner = await this.landingPartnerModel.findById(id).exec();
    if (!partner) throw new NotFoundException(`Landing partner '${id}' not found`);
    return partner;
  }

  async update(id: string, dto: UpdateLandingPartnerDto): Promise<LandingPartnerDocument> {
    const updated = await this.landingPartnerModel
      .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .exec();
    if (!updated) throw new NotFoundException(`Landing partner '${id}' not found`);
    return updated;
  }

  async remove(id: string): Promise<{ deleted: true; id: string }> {
    const deleted = await this.landingPartnerModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException(`Landing partner '${id}' not found`);
    return { deleted: true, id };
  }
}
