import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';

import { RequestBodyDto } from '@/common/dto/request-body.dto';
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
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}
