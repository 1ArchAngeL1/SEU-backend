import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

import { PolygonPointDto } from '@/common/dto/polygon-point.dto';
import { BuildingStatus } from '../enums/building-status.enum';

export class BuildingLocationDto {
  @ApiPropertyOptional({ description: 'Address (English)' })
  @IsOptional()
  @IsString()
  addressEn?: string;

  @ApiPropertyOptional({ description: 'Address (Georgian)' })
  @IsOptional()
  @IsString()
  addressKa?: string;
}

export class CreateBuildingDto {
  @ApiProperty({ description: 'Project (neighborhood) ObjectId' })
  @IsMongoId()
  project: string;

  @ApiProperty({ description: 'Building name (English)' })
  @IsString()
  @IsNotEmpty()
  nameEn: string;

  @ApiProperty({ description: 'Building name (Georgian)' })
  @IsString()
  @IsNotEmpty()
  nameKa: string;

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
  floorsAboveGround?: number;

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
  basementLevels?: number;

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

  @ApiPropertyOptional({ description: 'Description (English)' })
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional({ description: 'Description (Georgian)' })
  @IsOptional()
  @IsString()
  descriptionKa?: string;

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
