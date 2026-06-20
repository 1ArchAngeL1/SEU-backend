import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BuildingsModule } from './buildings/buildings.module';
import { FilesModule } from './files/files.module';
import { FloorsModule } from './floors/floors.module';
import { ProjectsModule } from './projects/projects.module';
import { UnitsModule } from './units/units.module';
import { PartnersModule } from './partners/partners.module';
import { RoomModule } from './room/room.module';
import { ContactsModule } from './contacts/contacts.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { NewsModule } from './news/news.module';
import { LegacyIndexCleanupService } from './common/services/legacy-index-cleanup.service';
import { Project, ProjectSchema } from './projects/schemas/project.schema';
import { Building, BuildingSchema } from './buildings/schemas/building.schema';
import { Unit, UnitSchema } from './units/schemas/unit.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI', 'mongodb://localhost:27017/seu'),
      }),
    }),
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: Building.name, schema: BuildingSchema },
      { name: Unit.name, schema: UnitSchema },
    ]),
    ProjectsModule,
    BuildingsModule,
    FloorsModule,
    UnitsModule,
    FilesModule,
    RoomModule,
    PartnersModule,
    ContactsModule,
    UserModule,
    AuthModule,
    NewsModule,
  ],
  controllers: [AppController],
  providers: [AppService, LegacyIndexCleanupService],
})
export class AppModule {}
