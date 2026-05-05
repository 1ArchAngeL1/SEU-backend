import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

import { Building, BuildingDocument } from '@/buildings/schemas/building.schema';
import { Project, ProjectDocument } from '@/projects/schemas/project.schema';
import { Unit, UnitDocument } from '@/units/schemas/unit.schema';
import { UnitStatus } from '@/units/enums/unit.enums';
import { parseRawPolygon } from '@/common/utils/polygon.util';
import { Floor, FloorDocument } from './schemas/floor.schema';
import { CreateFloorDto } from './dto/create-floor.dto';
import { QueryFloorDto } from './dto/query-floor.dto';
import { UpdateFloorDto } from './dto/update-floor.dto';

@Injectable()
export class FloorsService {
  constructor(
    @InjectModel(Floor.name) private readonly floorModel: Model<FloorDocument>,
    @InjectModel(Building.name) private readonly buildingModel: Model<BuildingDocument>,
    @InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(Unit.name) private readonly unitModel: Model<UnitDocument>,
  ) {}

  async create(dto: CreateFloorDto): Promise<FloorDocument> {
    const building = await this.buildingModel.findById(dto.building).select('project').exec();
    if (!building) {
      throw new BadRequestException(`Building '${dto.building}' does not exist`);
    }

    const dup = await this.floorModel.exists({
      building: building._id,
      floorNumber: dto.floorNumber,
    });
    if (dup) {
      throw new ConflictException(`Floor ${dto.floorNumber} already exists in this building`);
    }

    const polygon = this.resolvePolygon(dto);

    return this.floorModel.create({
      building: building._id,
      project: building.project,
      floorNumber: dto.floorNumber,
      floorImageId: dto.floorImageId,
      renderImage: dto.renderImage,
      polygon,
    });
  }

  async deleteByBuilding(buildingId: string | Types.ObjectId): Promise<void> {
    const objId = new Types.ObjectId(buildingId.toString());
    await this.unitModel.deleteMany({ building: objId });
    await this.floorModel.deleteMany({ building: objId });
  }

  async findAll(query: QueryFloorDto): Promise<FloorDocument[]> {
    const filter: FilterQuery<FloorDocument> = {};
    if (query.building) filter.building = new Types.ObjectId(query.building);
    if (query.project) filter.project = new Types.ObjectId(query.project);
    return this.floorModel.find(filter).sort({ floorNumber: 1 }).exec();
  }

  async findByBuilding(buildingId: string): Promise<FloorDocument[]> {
    return this.floorModel
      .find({ building: new Types.ObjectId(buildingId) })
      .sort({ floorNumber: 1 })
      .exec();
  }

  async findOne(id: string): Promise<FloorDocument> {
    const floor = await this.floorModel.findById(id).exec();
    if (!floor) throw new NotFoundException(`Floor '${id}' not found`);
    return floor;
  }

  async findByBuildingAndNumber(
    buildingId: string | Types.ObjectId,
    floorNumber: number,
  ): Promise<FloorDocument | null> {
    return this.floorModel
      .findOne({
        building: new Types.ObjectId(buildingId.toString()),
        floorNumber,
      })
      .exec();
  }

  async update(id: string, dto: UpdateFloorDto): Promise<FloorDocument> {
    const { rawPolygon, imageWidth, imageHeight, ...rest } = dto as any;
    const payload: Record<string, unknown> = { ...rest };
    if (rawPolygon) {
      if (!imageWidth || !imageHeight) {
        throw new BadRequestException('imageWidth and imageHeight are required when using rawPolygon');
      }
      payload.polygon = parseRawPolygon(rawPolygon, imageWidth, imageHeight);
    }
    const updated = await this.floorModel
      .findByIdAndUpdate(id, payload, { new: true, runValidators: true })
      .exec();
    if (!updated) throw new NotFoundException(`Floor '${id}' not found`);
    return updated;
  }

  async remove(id: string): Promise<{ deleted: true; id: string }> {
    const deleted = await this.floorModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException(`Floor '${id}' not found`);

    await this.unitModel.deleteMany({ floor: deleted._id });
    await this.recountBuildingUnits(deleted.building);
    await this.recountProjectUnits(deleted.project);

    return { deleted: true, id };
  }

  private resolvePolygon(dto: CreateFloorDto | UpdateFloorDto): any[] {
    const { rawPolygon, imageWidth, imageHeight } = dto as any;
    if (rawPolygon) {
      if (!imageWidth || !imageHeight) {
        throw new BadRequestException('imageWidth and imageHeight are required when using rawPolygon');
      }
      return parseRawPolygon(rawPolygon, imageWidth, imageHeight);
    }
    return (dto as any).polygon ?? [];
  }

  private async recountBuildingUnits(buildingId: Types.ObjectId): Promise<void> {
    const [total, available] = await Promise.all([
      this.unitModel.countDocuments({ building: buildingId }),
      this.unitModel.countDocuments({ building: buildingId, status: UnitStatus.AVAILABLE }),
    ]);
    await this.buildingModel.findByIdAndUpdate(buildingId, {
      $set: { totalUnits: total, availableUnits: available },
    });
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
