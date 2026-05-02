import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

import { Building, BuildingDocument } from '@/buildings/schemas/building.schema';
import { PaginationDto, SortDto } from '@/common/dto/request-body.dto';
import { PaginatedResult } from '@/common/interfaces/paginated-result.interface';
import { Floor, FloorDocument } from '@/floors/schemas/floor.schema';
import { Unit, UnitDocument } from '@/units/schemas/unit.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectFilterDto } from './dto/project-filter.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project, ProjectDocument } from './schemas/project.schema';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(Building.name) private readonly buildingModel: Model<BuildingDocument>,
    @InjectModel(Floor.name) private readonly floorModel: Model<FloorDocument>,
    @InjectModel(Unit.name) private readonly unitModel: Model<UnitDocument>,
  ) {}

  async create(dto: CreateProjectDto): Promise<ProjectDocument> {
    return this.projectModel.create(dto);
  }

  async findAll(
    filterDto: ProjectFilterDto,
    pagination?: PaginationDto,
    sort?: SortDto[],
  ): Promise<PaginatedResult<ProjectDocument>> {
    const { q, status, city, district, isActive, isFeatured } = filterDto;
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;

    const filter: FilterQuery<ProjectDocument> = {};
    if (status) filter.status = status;
    if (city) filter['location.city'] = city;
    if (district) filter['location.district'] = district;
    if (typeof isActive === 'boolean') filter.isActive = isActive;
    if (typeof isFeatured === 'boolean') filter.isFeatured = isFeatured;
    if (q) filter.$text = { $search: q };

    const skip = (page - 1) * limit;
    const sortBy =
      sort && sort.length
        ? sort.reduce<Record<string, 1 | -1>>(
            (acc, s) => ({ ...acc, [s.field]: s.direction === 'desc' ? -1 : 1 }),
            {},
          )
        : { createdAt: -1 as -1 };

    const [data, total] = await Promise.all([
      this.projectModel.find(filter).sort(sortBy).skip(skip).limit(limit).exec(),
      this.projectModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: string): Promise<ProjectDocument> {
    const project = await this.projectModel.findById(id).exec();
    if (!project) throw new NotFoundException(`Project '${id}' not found`);
    return project;
  }

  async update(id: string, dto: UpdateProjectDto): Promise<ProjectDocument> {
    const updated = await this.projectModel
      .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .exec();

    if (!updated) throw new NotFoundException(`Project '${id}' not found`);
    return updated;
  }

  async remove(id: string): Promise<{ deleted: true; id: string }> {
    const deleted = await this.projectModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException(`Project '${id}' not found`);

    const projectId = new Types.ObjectId(id);
    await Promise.all([
      this.unitModel.deleteMany({ project: projectId }),
      this.floorModel.deleteMany({ project: projectId }),
      this.buildingModel.deleteMany({ project: projectId }),
    ]);

    return { deleted: true, id };
  }
}
