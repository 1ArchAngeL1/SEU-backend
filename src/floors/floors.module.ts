import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Building, BuildingSchema } from '@/buildings/schemas/building.schema';
import { Project, ProjectSchema } from '@/projects/schemas/project.schema';
import { Unit, UnitSchema } from '@/units/schemas/unit.schema';
import { FloorsController } from './floors.controller';
import { FloorsService } from './floors.service';
import { Floor, FloorSchema } from './schemas/floor.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Floor.name, schema: FloorSchema },
      { name: Building.name, schema: BuildingSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Unit.name, schema: UnitSchema },
    ]),
  ],
  controllers: [FloorsController],
  providers: [FloorsService],
  exports: [FloorsService, MongooseModule],
})
export class FloorsModule {}
