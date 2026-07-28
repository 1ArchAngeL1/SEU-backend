import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Project, ProjectDocument } from '@/projects/schemas/project.schema';
import { Building, BuildingDocument } from '@/buildings/schemas/building.schema';
import { Unit, UnitDocument } from '@/units/schemas/unit.schema';

@Injectable()
export class LegacyIndexCleanupService implements OnModuleInit {
  private readonly logger = new Logger(LegacyIndexCleanupService.name);

  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(Building.name) private readonly buildingModel: Model<BuildingDocument>,
    @InjectModel(Unit.name) private readonly unitModel: Model<UnitDocument>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.dropStaleTextIndexes(this.projectModel, 'Project');
    await this.dropStaleTextIndexes(this.buildingModel, 'Building');
    await this.dropStaleTextIndexes(this.unitModel, 'Unit');
    await this.renameBuildingFloorFields();
  }

  private async dropStaleTextIndexes(model: Model<any>, label: string): Promise<void> {
    try {
      const indexes = await model.collection.indexes();
      for (const index of indexes) {
        const keys = Object.keys(index.key ?? {});
        const referencesOldLocalizedShape = keys.some((k) =>
          k.startsWith('name.') || k.startsWith('description.') || k.startsWith('location.city.') || k.startsWith('location.district.'),
        );
        if (referencesOldLocalizedShape && index.name) {
          await model.collection.dropIndex(index.name);
          this.logger.log(`Dropped stale index ${index.name} on ${label}`);
        }
      }
    } catch (err) {
      this.logger.warn(`Index cleanup on ${label} skipped: ${(err as Error).message}`);
    }
  }

  /**
   * One-shot rename of pre-rename Building documents.
   *   basementFloors  → floorsAboveGround
   *   parkingSpaces   → basementLevels
   * Safe to run repeatedly — only acts on docs that still carry the old names.
   */
  private async renameBuildingFloorFields(): Promise<void> {
    try {
      const result = await this.buildingModel.collection.updateMany(
        {
          $or: [
            { basementFloors: { $exists: true } },
            { parkingSpaces: { $exists: true } },
          ],
        },
        {
          $rename: {
            basementFloors: 'floorsAboveGround',
            parkingSpaces: 'basementLevels',
          },
        } as any,
      );
      if (result.modifiedCount > 0) {
        this.logger.log(
          `Renamed legacy Building fields on ${result.modifiedCount} document(s)`,
        );
      }
    } catch (err) {
      this.logger.warn(
        `Building field rename skipped: ${(err as Error).message}`,
      );
    }
  }
}
