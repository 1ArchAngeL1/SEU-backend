import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BuildingsModule } from '../buildings/buildings.module';
import { FloorsModule } from '../floors/floors.module';
import { ProjectsModule } from '../projects/projects.module';
import { ApartmentTypesController } from './apartment-types.controller';
import { ApartmentTypesService } from './apartment-types.service';
import {
  ApartmentType,
  ApartmentTypeSchema,
} from './schemas/apartment-type.schema';
import { Unit, UnitSchema } from './schemas/unit.schema';
import { UnitsController } from './units.controller';
import { UnitsService } from './units.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Unit.name, schema: UnitSchema },
      { name: ApartmentType.name, schema: ApartmentTypeSchema },
    ]),
    BuildingsModule,
    ProjectsModule,
    FloorsModule,
  ],
  controllers: [UnitsController, ApartmentTypesController],
  providers: [UnitsService, ApartmentTypesService],
  exports: [UnitsService, ApartmentTypesService],
})
export class UnitsModule {}
