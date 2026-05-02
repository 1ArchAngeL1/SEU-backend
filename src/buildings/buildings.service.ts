import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

import { PaginatedResult } from '@/common/interfaces/paginated-result.interface';
import { parseSort } from '@/common/utils/sort.util';
import { FloorsService } from '@/floors/floors.service';
import { Project, ProjectDocument } from '@/projects/schemas/project.schema';
import { Unit, UnitDocument } from '@/units/schemas/unit.schema';
import { UnitStatus } from '@/units/enums/unit.enums';
import { CreateBuildingDto } from './dto/create-building.dto';
import { QueryBuildingDto } from './dto/query-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { Building, BuildingDocument } from './schemas/building.schema';

@Injectable()
export class BuildingsService {
  constructor(
    @InjectModel(Building.name) private readonly buildingModel: Model<BuildingDocument>,
    @InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(Unit.name) private readonly unitModel: Model<UnitDocument>,
    private readonly floorsService: FloorsService,
  ) {}

  async create(dto: CreateBuildingDto): Promise<BuildingDocument> {
    const projectExists = await this.projectModel.exists({ _id: dto.project });
    if (!projectExists) {
      throw new BadRequestException(`Project '${dto.project}' does not exist`);
    }

    const dup = await this.buildingModel.exists({
      project: new Types.ObjectId(dto.project),
      block: dto.block.toUpperCase(),
    });
    if (dup) {
      throw new ConflictException(
        `Building with block '${dto.block}' already exists in this project`,
      );
    }

    const created = await this.buildingModel.create(dto);
    await this.recountProjectBuildings(dto.project);
    return created;
  }

  async findAll(query: QueryBuildingDto): Promise<PaginatedResult<BuildingDocument>> {
    const { page = 1, limit = 20, sort, q, project, block, status, isActive } = query;

    const filter: FilterQuery<BuildingDocument> = {};
    if (project) filter.project = new Types.ObjectId(project);
    if (block) filter.block = block.toUpperCase();
    if (status) filter.status = status;
    if (typeof isActive === 'boolean') filter.isActive = isActive;
    if (q) filter.$text = { $search: q };

    const skip = (page - 1) * limit;
    const sortBy = parseSort(sort) ?? { block: 1 };

    const [data, total] = await Promise.all([
      this.buildingModel
        .find(filter)
        .populate('project', 'name')
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.buildingModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: string): Promise<BuildingDocument> {
    const building = await this.buildingModel.findById(id).populate('project', 'name').exec();
    if (!building) throw new NotFoundException(`Building '${id}' not found`);
    return building;
  }

  async findByProject(projectId: string): Promise<BuildingDocument[]> {
    return this.buildingModel
      .find({ project: new Types.ObjectId(projectId) })
      .sort({ block: 1 })
      .exec();
  }

  async update(id: string, dto: UpdateBuildingDto): Promise<BuildingDocument> {
    const existing = await this.buildingModel.findById(id);
    if (!existing) throw new NotFoundException(`Building '${id}' not found`);

    if (dto.block && dto.block.toUpperCase() !== existing.block) {
      const dup = await this.buildingModel.exists({
        project: existing.project,
        block: dto.block.toUpperCase(),
        _id: { $ne: id },
      });
      if (dup) {
        throw new ConflictException(
          `Building with block '${dto.block}' already exists in this project`,
        );
      }
    }

    const updated = await this.buildingModel
      .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .populate('project', 'name')
      .exec();

    return updated!;
  }

  async remove(id: string): Promise<{ deleted: true; id: string }> {
    const deleted = await this.buildingModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException(`Building '${id}' not found`);
    await this.floorsService.deleteByBuilding(deleted._id);
    await this.recountProjectBuildings(deleted.project.toString());
    await this.recountProjectUnits(deleted.project);
    return { deleted: true, id };
  }

  async recountProjectBuildings(projectId: string): Promise<void> {
    const total = await this.buildingModel.countDocuments({
      project: new Types.ObjectId(projectId),
    });
    await this.projectModel.findByIdAndUpdate(projectId, { $set: { totalBuildings: total } });
  }

  private async recountProjectUnits(projectId: Types.ObjectId): Promise<void> {
    const [total, available] = await Promise.all([
      this.unitModel.countDocuments({ project: projectId }),
      this.unitModel.countDocuments({ project: projectId, status: UnitStatus.AVAILABLE }),
    ]);
    await this.projectModel.findByIdAndUpdate(projectId, {
      $set: { totalUnits: total, availableUnits: available },
    });
  }
}
