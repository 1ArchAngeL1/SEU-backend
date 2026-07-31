import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';

import { ProjectStatus } from '../enums/project-status.enum';
import { RequestBody } from '@/common/dto/request-body.dto';

export class GeoLocationDto {
  @ApiProperty({ description: 'Address (English)' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 300)
  addressEn: string;

  @ApiProperty({ description: 'Address (Georgian)' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 300)
  addressKa: string;

  @ApiPropertyOptional({ description: 'City (English)' })
  @IsOptional()
  @IsString()
  cityEn?: string;

  @ApiPropertyOptional({ description: 'City (Georgian)' })
  @IsOptional()
  @IsString()
  cityKa?: string;

  @ApiPropertyOptional({ description: 'District (English)' })
  @IsOptional()
  @IsString()
  districtEn?: string;

  @ApiPropertyOptional({ description: 'District (Georgian)' })
  @IsOptional()
  @IsString()
  districtKa?: string;
}

export class PriceRangeDto {
  @ApiPropertyOptional({ default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPricePerSqm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPricePerSqm?: number;
}

export class CreateProjectDto {
  @ApiProperty({ description: 'Project name (English)' })
  @IsString()
  @IsNotEmpty()
  nameEn: string;

  @ApiProperty({ description: 'Project name (Georgian)' })
  @IsString()
  @IsNotEmpty()
  nameKa: string;

  @ApiPropertyOptional({ description: 'Description (English)' })
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional({ description: 'Description (Georgian)' })
  @IsOptional()
  @IsString()
  descriptionKa?: string;

  @ApiProperty({ type: GeoLocationDto })
  @ValidateNested()
  @Type(() => GeoLocationDto)
  location: GeoLocationDto;

  @ApiPropertyOptional({ enum: ProjectStatus })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expectedCompletionDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  actualCompletionDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalLandArea?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mainImage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional({ type: PriceRangeDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PriceRangeDto)
  priceRange?: PriceRangeDto;

  @ApiPropertyOptional({ description: 'Project render image for interactive building polygon mapping' })
  @IsOptional()
  @IsString()
  renderImage?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({
    default: false,
    description: 'Pre-select this project by default on the apartment search page (only one project can be default)',
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  googleMapLink?: string;

  @ApiPropertyOptional({ description: 'Min apartment size (m²)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minSizeApartment?: number;

  @ApiPropertyOptional({ description: 'Max apartment size (m²)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxSizeApartment?: number;

  @ApiPropertyOptional({ description: 'Benefits (English)' })
  @IsOptional()
  @IsString()
  benefitsEn?: string;

  @ApiPropertyOptional({ description: 'Benefits (Georgian)' })
  @IsOptional()
  @IsString()
  benefitsKa?: string;
}

export class CreateProjectRequest extends RequestBody<CreateProjectDto> {
  @ApiProperty({ type: () => CreateProjectDto })
  @ValidateNested()
  @Type(() => CreateProjectDto)
  declare data: CreateProjectDto;
}
