import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

import { PolygonPointDto } from '@/common/dto/polygon-point.dto';
import { LocalizedStringDto } from '@/common/types/localized-string';
import { BuildingStatus } from '../enums/building-status.enum';

export class FloorPlanDto {
  @ApiProperty({ type: LocalizedStringDto })
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  name: LocalizedStringDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pdfUrl?: string;

  @ApiPropertyOptional({ type: LocalizedStringDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  description?: LocalizedStringDto;
}

export class BuildingLocationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;
}

export class CreateBuildingDto {
  @ApiProperty({ description: 'Project (neighborhood) ObjectId' })
  @IsMongoId()
  project: string;

  @ApiProperty({ type: LocalizedStringDto })
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  name: LocalizedStringDto;

  @ApiProperty({ example: 'A' })
  @IsString()
  @Length(1, 20)
  block: string;

  @ApiPropertyOptional({ type: BuildingLocationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BuildingLocationDto)
  location?: BuildingLocationDto;

  @ApiPropertyOptional({ enum: BuildingStatus })
  @IsOptional()
  @IsEnum(BuildingStatus)
  status?: BuildingStatus;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  basementFloors?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  totalUnits?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalSize?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  livableArea?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  parkingSpaces?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  constructionProgress?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mainImage?: string;

  @ApiPropertyOptional({ type: [FloorPlanDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FloorPlanDto)
  floorPlans?: FloorPlanDto[];

  @ApiPropertyOptional({ type: LocalizedStringDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  description?: LocalizedStringDto;

  @ApiPropertyOptional({ description: 'Building render image for interactive floor polygon mapping' })
  @IsOptional()
  @IsString()
  renderImage?: string;

  @ApiPropertyOptional({ type: [PolygonPointDto], description: 'Polygon coordinates on the project renderImage (percentage-based)' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PolygonPointDto)
  polygon?: PolygonPointDto[];

  @ApiPropertyOptional({ description: 'Raw pixel coordinates, e.g. "719,359,719,559,2911,593,2911,414". Requires imageWidth and imageHeight.' })
  @IsOptional()
  @IsString()
  rawPolygon?: string;

  @ApiPropertyOptional({ description: 'Source image width in pixels (required with rawPolygon)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  imageWidth?: number;

  @ApiPropertyOptional({ description: 'Source image height in pixels (required with rawPolygon)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  imageHeight?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
