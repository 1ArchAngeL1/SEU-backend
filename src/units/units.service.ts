import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

import { Building, BuildingDocument } from '../buildings/schemas/building.schema';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { parseSort } from '../common/utils/sort.util';
import { FloorsService } from '../floors/floors.service';
import { Project, ProjectDocument } from '../projects/schemas/project.schema';
import { RoomDto } from '../room/dto/room.dto';
import { CreateUnitDto } from './dto/create-unit.dto';
import { QueryUnitDto } from './dto/query-unit.dto';
import { StatusUpdateDto } from './dto/status-update.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { UnitStatus } from './enums/unit.enums';
import { Unit, UnitDocument } from './schemas/unit.schema';

@Injectable()
export class UnitsService {
  constructor(
    @InjectModel(Unit.name) private readonly unitModel: Model<UnitDocument>,
    @InjectModel(Building.name) private readonly buildingModel: Model<BuildingDocument>,
    @InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>,
    private readonly floorsService: FloorsService,
  ) {}

  async create(dto: CreateUnitDto): Promise<UnitDocument> {
    const building = await this.buildingModel.findById(dto.building);
    if (!building) {
      throw new BadRequestException(`Building '${dto.building}' does not exist`);
    }
    if (building.project.toString() !== dto.project) {
      throw new BadRequestException(
        'project does not match the parent building.project — denormalized field is wrong',
      );
    }

    const floor = await this.floorsService.findByBuildingAndNumber(dto.building, dto.floorNumber);
    if (!floor) {
      throw new BadRequestException(`Floor ${dto.floorNumber} does not exist for this building`);
    }

    const dup = await this.unitModel.exists({
      building: new Types.ObjectId(dto.building),
      unitNumber: dto.unitNumber,
    });
    if (dup) {
      throw new ConflictException(`Unit '${dto.unitNumber}' already exists in this building`);
    }

    const created = await this.unitModel.create({
      ...dto,
      block: dto.block.toUpperCase(),
      floor: floor._id,
      floorNumber: dto.floorNumber,
    });

    await this.recountForBuilding(dto.building);
    await this.recountForProject(dto.project);

    return created;
  }

  async findAll(query: QueryUnitDto): Promise<PaginatedResult<UnitDocument>> {
    const filter = this.buildFilter(query);
    const { page = 1, limit = 20, sort } = query;

    const skip = (page - 1) * limit;
    const sortBy = parseSort(sort) ?? { floorNumber: 1, unitNumber: 1 };

    const [data, total] = await Promise.all([
      this.unitModel
        .find(filter)
        .populate('project', 'name')
        .populate('building', 'name block')
        .populate('floor', 'floorNumber')
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.unitModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: string): Promise<UnitDocument> {
    const unit = await this.unitModel
      .findById(id)
      .populate('project', 'name')
      .populate('building', 'name block')
      .populate('floor', 'floorNumber')
      .exec();
    if (!unit) throw new NotFoundException(`Unit '${id}' not found`);
    return unit;
  }

  async update(id: string, dto: UpdateUnitDto): Promise<UnitDocument> {
    const existing = await this.unitModel.findById(id);
    if (!existing) throw new NotFoundException(`Unit '${id}' not found`);

    if (dto.unitNumber && dto.unitNumber !== existing.unitNumber) {
      const dup = await this.unitModel.exists({
        building: existing.building,
        unitNumber: dto.unitNumber,
        _id: { $ne: id },
      });
      if (dup) {
        throw new ConflictException(`Unit '${dto.unitNumber}' already exists in this building`);
      }
    }

    const payload: Record<string, unknown> = { ...dto };
    if (dto.block) payload.block = dto.block.toUpperCase();

    const updated = await this.unitModel
      .findByIdAndUpdate(id, payload, { new: true, runValidators: true })
      .populate('project', 'name')
      .populate('building', 'name block')
      .exec();

    if (dto.status && dto.status !== existing.status) {
      await this.recountForBuilding(existing.building.toString());
      await this.recountForProject(existing.project.toString());
    }

    return updated!;
  }

  async updateStatus(id: string, dto: StatusUpdateDto): Promise<UnitDocument> {
    const update: Record<string, unknown> = { status: dto.status };

    if (dto.status === UnitStatus.RESERVED && dto.reservation) {
      update.reservation = { reservedAt: new Date(), ...dto.reservation };
    }
    if (dto.status === UnitStatus.SOLD && dto.saleRecord) {
      update.saleRecord = { soldAt: new Date(), ...dto.saleRecord };
    }
    if (dto.status === UnitStatus.AVAILABLE) {
      update.reservation = null;
    }

    const updated = await this.unitModel
      .findByIdAndUpdate(id, update, { new: true, runValidators: true })
      .populate('project', 'name')
      .populate('building', 'name block')
      .exec();

    if (!updated) throw new NotFoundException(`Unit '${id}' not found`);

    await this.recountForBuilding(updated.building.toString());
    await this.recountForProject(updated.project.toString());

    return updated;
  }

  async remove(id: string): Promise<{ deleted: true; id: string }> {
    const deleted = await this.unitModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException(`Unit '${id}' not found`);
    await this.recountForBuilding(deleted.building.toString());
    await this.recountForProject(deleted.project.toString());
    return { deleted: true, id };
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.unitModel.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
  }

  async syncRooms(id: string, rooms: RoomDto[]): Promise<UnitDocument> {
    const updated = await this.unitModel
      .findByIdAndUpdate(id, { $set: { rooms } }, { new: true, runValidators: true })
      .exec();
    if (!updated) throw new NotFoundException(`Unit '${id}' not found`);
    return updated;
  }

  async statsByProject(projectId: string) {
    const objId = new Types.ObjectId(projectId);
    const [byStatus, byType, priceStats] = await Promise.all([
      this.unitModel.aggregate([
        { $match: { project: objId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.unitModel.aggregate([
        { $match: { project: objId } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
      this.unitModel.aggregate([
        { $match: { project: objId } },
        {
          $group: {
            _id: null,
            avgPrice: { $avg: '$price.amount' },
            minPrice: { $min: '$price.amount' },
            maxPrice: { $max: '$price.amount' },
            totalArea: { $sum: '$totalSize' },
            avgSize: { $avg: '$totalSize' },
          },
        },
      ]),
    ]);

    return {
      project: projectId,
      byStatus: Object.fromEntries(byStatus.map((x) => [x._id, x.count])),
      byType: Object.fromEntries(byType.map((x) => [x._id, x.count])),
      pricing: priceStats[0] ?? null,
    };
  }

  private buildFilter(query: QueryUnitDto): FilterQuery<UnitDocument> {
    const filter: FilterQuery<UnitDocument> = {};

    if (query.project) filter.project = new Types.ObjectId(query.project);
    if (query.building) filter.building = new Types.ObjectId(query.building);
    if (query.block) filter.block = query.block.toUpperCase();
    if (query.status) filter.status = query.status;
    if (query.type) filter.type = query.type;
    if (query.furnishingStatus) filter.furnishingStatus = query.furnishingStatus;

    if (typeof query.bedrooms === 'number') {
      filter.bedrooms = query.bedrooms;
    } else if (query.minBedrooms != null || query.maxBedrooms != null) {
      filter.bedrooms = {};
      if (query.minBedrooms != null) filter.bedrooms.$gte = query.minBedrooms;
      if (query.maxBedrooms != null) filter.bedrooms.$lte = query.maxBedrooms;
    }

    if (typeof query.floorNumber === 'number') {
      filter.floorNumber = query.floorNumber;
    } else if (query.minFloor != null || query.maxFloor != null) {
      filter.floorNumber = {};
      if (query.minFloor != null) filter.floorNumber.$gte = query.minFloor;
      if (query.maxFloor != null) filter.floorNumber.$lte = query.maxFloor;
    }

    if (query.minSize != null || query.maxSize != null) {
      filter.totalSize = {};
      if (query.minSize != null) filter.totalSize.$gte = query.minSize;
      if (query.maxSize != null) filter.totalSize.$lte = query.maxSize;
    }

    if (query.minPrice != null || query.maxPrice != null) {
      filter['price.amount'] = {};
      if (query.minPrice != null) filter['price.amount'].$gte = query.minPrice;
      if (query.maxPrice != null) filter['price.amount'].$lte = query.maxPrice;
    }

    if (typeof query.isActive === 'boolean') filter.isActive = query.isActive;

    if (query.q) filter.$text = { $search: query.q };

    return filter;
  }

  private async recountForBuilding(buildingId: string): Promise<void> {
    const objId = new Types.ObjectId(buildingId);
    const [total, available] = await Promise.all([
      this.unitModel.countDocuments({ building: objId }),
      this.unitModel.countDocuments({ building: objId, status: UnitStatus.AVAILABLE }),
    ]);
    await this.buildingModel.findByIdAndUpdate(buildingId, {
      $set: { totalUnits: total, availableUnits: available },
    });
  }

  private async recountForProject(projectId: string): Promise<void> {
    const objId = new Types.ObjectId(projectId);
    const [total, available] = await Promise.all([
      this.unitModel.countDocuments({ project: objId }),
      this.unitModel.countDocuments({ project: objId, status: UnitStatus.AVAILABLE }),
    ]);
    await this.projectModel.findByIdAndUpdate(projectId, {
      $set: { totalUnits: total, availableUnits: available },
    });
  }
}
