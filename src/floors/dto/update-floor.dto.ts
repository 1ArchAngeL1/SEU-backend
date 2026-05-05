import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

import { PolygonPointDto } from '@/common/dto/polygon-point.dto';

export class UpdateFloorDto {
  @ApiPropertyOptional({ description: 'Identifier of the floor image asset (e.g. CDN/storage id)' })
  @IsOptional()
  @IsString()
  floorImageId?: string;

  @ApiPropertyOptional({ description: '2D floor plan render for interactive unit polygon mapping' })
  @IsOptional()
  @IsString()
  renderImage?: string;

  @ApiPropertyOptional({ type: [PolygonPointDto], description: 'Polygon coordinates on the building renderImage (percentage-based)' })
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
}
