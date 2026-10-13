import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { RequestBodyDto } from '../../common/dto/request-body.dto';
import { ToNumberArray, ToStringArray } from '../../common/dto/to-array';
import { ToBoolean } from '../../common/dto/to-boolean';
import { FurnishingStatus, UnitStatus, UnitType } from '../enums/unit.enums';

export class QueryUnitDto extends RequestBodyDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  project?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  building?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  block?: string;

  @ApiPropertyOptional({ enum: UnitStatus })
  @IsOptional()
  @IsEnum(UnitStatus)
  status?: UnitStatus;

  @ApiPropertyOptional({ enum: UnitType })
  @IsOptional()
  @IsEnum(UnitType)
  type?: UnitType;

  @ApiPropertyOptional({
    enum: UnitType,
    isArray: true,
    description:
      'Unit types to include, comma-separated — `?types=living,parking`. ' +
      'The public search uses it to leave commercial units out server-side so ' +
      'the pagination totals match what is shown. Combined with `type` by AND.',
  })
  @IsOptional()
  @ToStringArray()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(10)
  @IsEnum(UnitType, { each: true })
  types?: UnitType[];

  @ApiPropertyOptional({ enum: FurnishingStatus })
  @IsOptional()
  @IsEnum(FurnishingStatus)
  furnishingStatus?: FurnishingStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  bedrooms?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  minBedrooms?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxBedrooms?: number;

  @ApiPropertyOptional({
    type: Number,
    isArray: true,
    description:
      'Exact bedroom counts, comma-separated — `?bedroomCounts=1,4` means ' +
      '"1 bedroom or 4 bedrooms". A multi-select cannot be expressed as a ' +
      'min/max range: `minBedrooms=1&maxBedrooms=4` would also return the ' +
      '2- and 3-bedroom units nobody asked for.',
  })
  @IsOptional()
  @ToNumberArray()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(20)
  @IsInt({ each: true })
  @Min(0, { each: true })
  bedroomCounts?: number[];

  @ApiPropertyOptional({
    description: 'Studio apartments — a studio room with zero bedrooms',
  })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  studio?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  floorNumber?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  minFloor?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxFloor?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minSize?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxSize?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description:
      'Public site: return only units the admin has left active, in an active ' +
      'block, in an active project. Admin screens omit this and see everything.',
  })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  visibleOnly?: boolean;
}
