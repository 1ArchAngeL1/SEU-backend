import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PaginationDto, SortDto } from '@/common/dto/request-body.dto';
import { PaginatedResult } from '@/common/interfaces/paginated-result.interface';
import { CreateResumeDto } from './dto/create-resume.dto';
import { ResumeFilterDto } from './dto/search-resumes.dto';
import { UpdateResumeStatusDto } from './dto/update-resume-status.dto';
import { Resume, ResumeDocument } from './schemas/resume.schema';

@Injectable()
export class ResumesService {
  constructor(
    @InjectModel(Resume.name) private readonly resumeModel: Model<ResumeDocument>,
  ) {}

  async create(dto: CreateResumeDto): Promise<ResumeDocument> {
    return this.resumeModel.create(dto);
  }

  async findAll(
    filter?: ResumeFilterDto,
    pagination?: PaginationDto,
    sort?: SortDto[],
  ): Promise<PaginatedResult<ResumeDocument>> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (filter?.q) {
      query.$or = [
        { fileName: { $regex: filter.q, $options: 'i' } },
        { position: { $regex: filter.q, $options: 'i' } },
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
      this.resumeModel.find(query).sort(sortBy).skip(skip).limit(limit).exec(),
      this.resumeModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: string): Promise<ResumeDocument> {
    const resume = await this.resumeModel.findById(id).exec();
    if (!resume) throw new NotFoundException(`Resume '${id}' not found`);
    return resume;
  }

  async updateStatus(id: string, dto: UpdateResumeStatusDto): Promise<ResumeDocument> {
    const updated = await this.resumeModel
      .findByIdAndUpdate(id, { status: dto.status }, { new: true, runValidators: true })
      .exec();
    if (!updated) throw new NotFoundException(`Resume '${id}' not found`);
    return updated;
  }
}