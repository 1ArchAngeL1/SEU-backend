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
import { parseRawPolygon } from '../common/utils/polygon.util';
import { parseSort } from '../common/utils/sort.util';
import { applyHiddenIds, findHiddenIds } from '../common/utils/visibility.util';
import { FloorsService } from '../floors/floors.service';
import { Project, ProjectDocument } from '../projects/schemas/project.schema';
import { RoomDto } from '../room/dto/room.dto';
import { CreateUnitDto } from './dto/create-unit.dto';
import { QueryUnitDto } from './dto/query-unit.dto';
import { StatusUpdateDto } from './dto/status-update.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { UnitStatus, UnitType } from './enums/unit.enums';
import { Unit, UnitDocument } from './schemas/unit.schema';

/**
 * The number of bedrooms a unit really has, as an aggregation expression.
 *
 * It must agree with `bedroomCount()` on the site (`src/lib/room-counts.ts`),
 * which is what prints the figure on the card and the detail page: rooms win
 * whenever the unit has any, and the stale imported `bedrooms` scalar is used
 * only for the units whose `rooms` array is empty — for those it is the sole
 * surviving record of the layout. Counting rooms alone made every one of them
 * read as 0 bedrooms, so a unit the site labels "2 bedrooms" was missing from
 * the 2-bedroom results.
 *
 * `rooms` is null-filtered first: the import left null entries behind in some
 * arrays, and `[null]` is not a layout — it has to fall back like an empty one.
 */
const BEDROOM_COUNT = {
  $let: {
    vars: {
      roomsArr: {
        $filter: {
          input: { $ifNull: ['$rooms', []] },
          as: 'r',
          cond: { $eq: [{ $type: '$$r' }, 'object'] },
        },
      },
    },
    in: {
      $cond: [
        { $gt: [{ $size: '$$roomsArr' }, 0] },
        {
          $size: {
            $filter: {
              input: '$$roomsArr',
              as: 'r',
              cond: { $eq: ['$$r.type', 'bedroom'] },
            },
          },
        },
        // Not a number on every legacy document, so coerce and default.
        { $convert: { input: '$bedrooms', to: 'int', onError: 0, onNull: 0 } },
      ],
    },
  },
};

/**
 * AND a condition on `type` into a filter that may already carry one.
 *
 * Assigning `filter.type` directly would silently replace an existing
 * condition — which is how the apartments-first pagination used to drop an
 * explicit `?type=parking` and answer with apartments instead. Mutates and
 * returns the same object, mirroring `applyHiddenIds`.
 */
function narrowType(
  filter: FilterQuery<UnitDocument>,
  cond: unknown,
): FilterQuery<UnitDocument> {
  const f = filter as Record<string, any>;
  if (f.type === undefined) {
    f.type = cond;
    return filter;
  }
  const existing = f.type;
  delete f.type;
  f.$and = [...(f.$and ?? []), { type: existing }, { type: cond }];
  return filter;
}

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

    const { rawPolygon, imageWidth, imageHeight, ...restDto } = dto as any;
    const payload: Record<string, unknown> = {
      ...restDto,
      block: dto.block.toUpperCase(),
      floor: floor._id,
      floorNumber: dto.floorNumber,
    };
    if (rawPolygon) {
      if (!imageWidth || !imageHeight) {
        throw new BadRequestException('imageWidth and imageHeight are required when using rawPolygon');
      }
      payload.polygon = parseRawPolygon(rawPolygon, imageWidth, imageHeight);
    }

    const created = await this.unitModel.create(payload);

    await this.recountForBuilding(dto.building);
    await this.recountForProject(dto.project);

    return created;
  }

  async findAll(query: QueryUnitDto): Promise<PaginatedResult<UnitDocument>> {
    const filter = await this.buildVisibleFilter(query);
    const { page = 1, limit = 20, sort } = query;

    const skip = (page - 1) * limit;

    // Special ordering used by the public search page: living units (apartments)
    // first, then commercial and every other unit type — kept stable across pages.
    if (sort === 'typePriority') {
      return this.findAllApartmentsFirst(filter, page, limit, skip);
    }

    const sortBy = parseSort(sort) ?? { floorNumber: 1, unitNumber: 1 };

    const [data, total] = await Promise.all([
      this.unitModel
        .find(filter)
        .populate('project', 'nameEn nameKa isActive')
        .populate('building', 'nameEn nameKa block isActive')
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

  /**
   * Paginate with living units (apartments) ordered before every other unit
   * type, keeping the order stable across page boundaries. Runs the two tiers
   * as separate `find()` queries so results stay Mongoose documents (correct
   * `id` serialization via the schema `toJSON` transform).
   */
  private async findAllApartmentsFirst(
    filter: FilterQuery<UnitDocument>,
    page: number,
    limit: number,
    skip: number,
  ): Promise<PaginatedResult<UnitDocument>> {
    const secondarySort: Record<string, 1 | -1> = { floorNumber: 1, unitNumber: 1 };
    // The tier condition is ANDed in, never assigned: the caller's own `type` /
    // `types` filter has to survive the split, otherwise `?type=parking` comes
    // back as apartments. A tier that contradicts it simply matches nothing.
    const livingFilter = narrowType({ ...filter }, UnitType.LIVING);
    const restFilter = narrowType({ ...filter }, { $ne: UnitType.LIVING });

    const findTier = (tier: FilterQuery<UnitDocument>, tierSkip: number, tierLimit: number) =>
      this.unitModel
        .find(tier)
        .populate('project', 'nameEn nameKa isActive')
        .populate('building', 'nameEn nameKa block isActive')
        .populate('floor', 'floorNumber')
        .sort(secondarySort)
        .skip(tierSkip)
        .limit(tierLimit)
        .exec();

    const [livingTotal, restTotal] = await Promise.all([
      this.unitModel.countDocuments(livingFilter).exec(),
      this.unitModel.countDocuments(restFilter).exec(),
    ]);
    const total = livingTotal + restTotal;

    let data: UnitDocument[];
    if (skip + limit <= livingTotal) {
      // Window sits entirely inside the living (apartment) tier.
      data = await findTier(livingFilter, skip, limit);
    } else if (skip >= livingTotal) {
      // Window sits entirely inside the non-living tier.
      data = await findTier(restFilter, skip - livingTotal, limit);
    } else {
      // Window straddles the boundary: tail of the living tier + head of the rest.
      const livingRemaining = livingTotal - skip;
      const [livingPart, restPart] = await Promise.all([
        findTier(livingFilter, skip, livingRemaining),
        findTier(restFilter, 0, limit - livingRemaining),
      ]);
      data = [...livingPart, ...restPart];
    }

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: string, visibleOnly = false): Promise<UnitDocument> {
    const unit = await this.unitModel
      .findById(id)
      .populate('project', 'nameEn nameKa isActive')
      .populate('building', 'nameEn nameKa block isActive')
      .populate('floor', 'floorNumber')
      .exec();
    if (!unit) throw new NotFoundException(`Unit '${id}' not found`);

    // Public deep link: a unit switched off itself, or sitting in a switched-off
    // block or project, must read as missing rather than render.
    if (visibleOnly && !(await this.isPubliclyVisible(unit))) {
      throw new NotFoundException(`Unit '${id}' not found`);
    }
    return unit;
  }

  /** The project → block → unit cascade, for a single already-loaded unit. */
  private async isPubliclyVisible(unit: UnitDocument): Promise<boolean> {
    if (unit.isActive === false) return false;

    const [building, project] = await Promise.all([
      this.buildingModel.findById(unit.building).select('isActive').lean().exec(),
      this.projectModel.findById(unit.project).select('isActive').lean().exec(),
    ]);
    return building?.isActive !== false && project?.isActive !== false;
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

    const { rawPolygon, imageWidth, imageHeight, ...restUpdate } = dto as any;
    const payload: Record<string, unknown> = { ...restUpdate };
    if (dto.block != null) payload.block = dto.block.toUpperCase();
    if (rawPolygon) {
      if (!imageWidth || !imageHeight) {
        throw new BadRequestException('imageWidth and imageHeight are required when using rawPolygon');
      }
      payload.polygon = parseRawPolygon(rawPolygon, imageWidth, imageHeight);
    }

    const updated = await this.unitModel
      .findByIdAndUpdate(id, payload, { new: true, runValidators: true })
      .populate('project', 'nameEn nameKa isActive')
      .populate('building', 'nameEn nameKa block isActive')
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
      .populate('project', 'nameEn nameKa isActive')
      .populate('building', 'nameEn nameKa block isActive')
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

  /**
   * `buildFilter` plus the public-site cascade when `visibleOnly` is set: a
   * unit is public only when the unit, its block and its project are all
   * active. Admin requests omit the flag and keep seeing everything.
   */
  private async buildVisibleFilter(query: QueryUnitDto): Promise<FilterQuery<UnitDocument>> {
    const filter = this.buildFilter(query);
    if (!query.visibleOnly) return filter;

    const hidden = await findHiddenIds(this.projectModel, this.buildingModel);
    return applyHiddenIds(filter, hidden);
  }

  private buildFilter(query: QueryUnitDto): FilterQuery<UnitDocument> {
    const filter: FilterQuery<UnitDocument> = {};

    if (query.project) filter.project = new Types.ObjectId(query.project);
    if (query.building) filter.building = new Types.ObjectId(query.building);
    if (query.block) filter.block = query.block.toUpperCase();
    if (query.status) filter.status = query.status;
    if (query.furnishingStatus) filter.furnishingStatus = query.furnishingStatus;

    // `type` (one) and `types` (a set) are independent filters and are ANDed,
    // so a caller passing both gets the intersection rather than whichever the
    // code happened to assign last.
    if (query.type) narrowType(filter, query.type);
    if (query.types?.length) narrowType(filter, { $in: query.types });

    // Room / bedroom filtering counts the actual `rooms` array; the stale
    // scalar is the fallback for units that have no rooms at all. See
    // BEDROOM_COUNT — the filter has to agree with what the site prints on the
    // card, or a unit labelled "2 bedrooms" is missing from the 2-bedroom
    // results. A bedroom is a room of type 'bedroom'; a studio is a unit with
    // a studio room and zero bedrooms. Selections are OR-ed so a mixed pick
    // (e.g. studio + 2-bedroom) matches either.
    const roomConds: FilterQuery<UnitDocument>[] = [];
    if (query.studio) {
      roomConds.push({
        'rooms.type': 'studio',
        $expr: { $eq: [BEDROOM_COUNT, 0] },
      });
    }
    // An exact set wins over the range: `bedroomCounts=1,4` must not quietly
    // become "1 through 4".
    if (query.bedroomCounts?.length) {
      roomConds.push({ $expr: { $in: [BEDROOM_COUNT, query.bedroomCounts] } });
    } else if (typeof query.bedrooms === 'number') {
      roomConds.push({ $expr: { $eq: [BEDROOM_COUNT, query.bedrooms] } });
    } else if (query.minBedrooms != null || query.maxBedrooms != null) {
      const bounds: Record<string, unknown>[] = [];
      if (query.minBedrooms != null)
        bounds.push({ $gte: [BEDROOM_COUNT, query.minBedrooms] });
      if (query.maxBedrooms != null)
        bounds.push({ $lte: [BEDROOM_COUNT, query.maxBedrooms] });
      roomConds.push({
        $expr: bounds.length === 1 ? bounds[0] : { $and: bounds },
      });
    }
    if (roomConds.length === 1) {
      Object.assign(filter, roomConds[0]);
    } else if (roomConds.length > 1) {
      // Each branch carries its own `$expr`, which cannot be merged into the
      // single top-level `$expr` key — `$or` is the only correct spelling.
      filter.$or = roomConds;
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
