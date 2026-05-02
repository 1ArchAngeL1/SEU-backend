import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Building, BuildingSchema } from '@/buildings/schemas/building.schema';
import { Floor, FloorSchema } from '@/floors/schemas/floor.schema';
import { Unit, UnitSchema } from '@/units/schemas/unit.schema';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { Project, ProjectSchema } from './schemas/project.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: Building.name, schema: BuildingSchema },
      { name: Floor.name, schema: FloorSchema },
      { name: Unit.name, schema: UnitSchema },
    ]),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService, MongooseModule],
})
export class ProjectsModule {}
