import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';

import { RequestBodyDto } from '@/common/dto/request-body.dto';
import { ToBoolean } from '@/common/dto/to-boolean';
import { BuildingStatus } from '../enums/building-status.enum';

export class QueryBuildingDto extends RequestBodyDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  project?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  block?: string;

  @ApiPropertyOptional({ enum: BuildingStatus })
  @IsOptional()
  @IsEnum(BuildingStatus)
  status?: BuildingStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description:
      'Public site: return only active blocks in active projects. Admin ' +
      'screens omit this and see everything.',
  })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  visibleOnly?: boolean;
}
