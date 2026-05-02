import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FloorsModule } from '@/floors/floors.module';
import { ProjectsModule } from '@/projects/projects.module';
import { Unit, UnitSchema } from '@/units/schemas/unit.schema';
import { BuildingsController } from './buildings.controller';
import { BuildingsService } from './buildings.service';
import { Building, BuildingSchema } from './schemas/building.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Building.name, schema: BuildingSchema },
      { name: Unit.name, schema: UnitSchema },
    ]),
    ProjectsModule,
    FloorsModule,
  ],
  controllers: [BuildingsController],
  providers: [BuildingsService],
  exports: [BuildingsService, MongooseModule],
})
export class BuildingsModule {}
