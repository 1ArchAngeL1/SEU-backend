import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BuildingsModule } from '../buildings/buildings.module';
import { FloorsModule } from '../floors/floors.module';
import { ProjectsModule } from '../projects/projects.module';
import { Unit, UnitSchema } from './schemas/unit.schema';
import { UnitsController } from './units.controller';
import { UnitsService } from './units.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Unit.name, schema: UnitSchema }]),
    BuildingsModule,
    ProjectsModule,
    FloorsModule,
  ],
  controllers: [UnitsController],
  providers: [UnitsService],
  exports: [UnitsService],
})
export class UnitsModule {}
