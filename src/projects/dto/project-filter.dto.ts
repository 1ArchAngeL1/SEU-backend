import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';

import { ProjectStatus } from '../enums/project-status.enum';
import { RequestBody } from '@/common/dto/request-body.dto';

export class ProjectFilterDto {
  @ApiPropertyOptional({ enum: ProjectStatus })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'Free-text search.' })
  @IsOptional()
  @IsString()
  q?: string;
}

export class SearchProjectsRequest extends RequestBody<ProjectFilterDto> {
  @ApiProperty({ type: () => ProjectFilterDto })
  @ValidateNested()
  @Type(() => ProjectFilterDto)
  declare data: ProjectFilterDto;
}
