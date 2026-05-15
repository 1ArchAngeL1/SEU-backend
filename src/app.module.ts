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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
