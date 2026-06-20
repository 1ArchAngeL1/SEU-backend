import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

import { PaginationDto, SortDto } from '@/common/dto/request-body.dto';
import { PaginatedResult } from '@/common/interfaces/paginated-result.interface';
import { Project, ProjectDocument } from '@/projects/schemas/project.schema';
import { CreateApartmentTypeDto } from './dto/create-apartment-type.dto';
import { ApartmentTypeFilterDto } from './dto/search-apartment-type.dto';
import { UpdateApartmentTypeDto } from './dto/update-apartment-type.dto';
import {
  ApartmentType,
  ApartmentTypeDocument,
} from './schemas/apartment-type.schema';

@Injectable()
export class ApartmentTypesService {
  constructor(
    @InjectModel(ApartmentType.name)
    private readonly apartmentTypeModel: Model<ApartmentTypeDocument>,
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
  ) {}

  async create(dto: CreateApartmentTypeDto): Promise<ApartmentTypeDocument> {
    if (dto.sizeTo < dto.sizeFrom) {
      throw new BadRequestException('sizeTo must be greater than or equal to sizeFrom');
    }

    const project = await this.projectModel.exists({ _id: dto.project });
    if (!project) {
      throw new BadRequestException(`Project '${dto.project}' does not exist`);
    }

    return this.apartmentTypeModel.create(dto);
  }

  async findAll(
    filter?: ApartmentTypeFilterDto,
    pagination?: PaginationDto,
    sort?: SortDto[],
  ): Promise<PaginatedResult<ApartmentTypeDocument>> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;

    const query: FilterQuery<ApartmentTypeDocument> = {};
    if (filter?.project) query.project = new Types.ObjectId(filter.project);
    if (typeof filter?.bedrooms === 'number') query.bedrooms = filter.bedrooms;
    if (typeof filter?.isActive === 'boolean') query.isActive = filter.isActive;

    const sortBy =
      sort && sort.length
        ? sort.reduce<Record<string, 1 | -1>>(
            (acc, s) => ({ ...acc, [s.field]: s.direction === 'desc' ? -1 : 1 }),
            {},
          )
        : { bedrooms: 1 as 1, sizeFrom: 1 as 1 };

    const [data, total] = await Promise.all([
      this.apartmentTypeModel
        .find(query)
        .populate('project', 'nameEn nameKa')
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.apartmentTypeModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findByProject(projectId: string): Promise<ApartmentTypeDocument[]> {
    return this.apartmentTypeModel
      .find({ project: new Types.ObjectId(projectId) })
      .sort({ bedrooms: 1, sizeFrom: 1 })
      .exec();
  }

  async findOne(id: string): Promise<ApartmentTypeDocument> {
    const apartmentType = await this.apartmentTypeModel
      .findById(id)
      .populate('project', 'nameEn nameKa')
      .exec();
    if (!apartmentType) {
      throw new NotFoundException(`ApartmentType '${id}' not found`);
    }
    return apartmentType;
  }

  async update(
    id: string,
    dto: UpdateApartmentTypeDto,
  ): Promise<ApartmentTypeDocument> {
    const existing = await this.apartmentTypeModel.findById(id).exec();
    if (!existing) {
      throw new NotFoundException(`ApartmentType '${id}' not found`);
    }

    const nextSizeFrom = dto.sizeFrom ?? existing.sizeFrom;
    const nextSizeTo = dto.sizeTo ?? existing.sizeTo;
    if (nextSizeTo < nextSizeFrom) {
      throw new BadRequestException('sizeTo must be greater than or equal to sizeFrom');
    }

    if (dto.project && dto.project !== existing.project.toString()) {
      const project = await this.projectModel.exists({ _id: dto.project });
      if (!project) {
        throw new BadRequestException(`Project '${dto.project}' does not exist`);
      }
    }

    const updated = await this.apartmentTypeModel
      .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .populate('project', 'nameEn nameKa')
      .exec();

    return updated!;
  }

  async remove(id: string): Promise<{ deleted: true; id: string }> {
    const deleted = await this.apartmentTypeModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`ApartmentType '${id}' not found`);
    }
    return { deleted: true, id };
  }
}
