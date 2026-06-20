import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

import { RequestBody } from '@/common/dto/request-body.dto';

export class CreateApartmentTypeDto {
  @ApiProperty({ description: 'Project this apartment type belongs to' })
  @IsMongoId()
  project: string;

  @ApiPropertyOptional({ description: 'Name (English)' })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiPropertyOptional({ description: 'Name (Georgian)' })
  @IsOptional()
  @IsString()
  nameKa?: string;

  @ApiProperty({ description: 'Number of bedrooms' })
  @IsInt()
  @Min(0)
  bedrooms: number;

  @ApiProperty({ description: 'Min apartment size (m²)' })
  @IsNumber()
  @Min(0)
  sizeFrom: number;

  @ApiProperty({ description: 'Max apartment size (m²)' })
  @IsNumber()
  @Min(0)
  sizeTo: number;

  @ApiPropertyOptional({ description: 'Apartment type image (file uuid or url)' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ description: 'Description (English)' })
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional({ description: 'Description (Georgian)' })
  @IsOptional()
  @IsString()
  descriptionKa?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateApartmentTypeRequest extends RequestBody<CreateApartmentTypeDto> {
  @ApiProperty({ type: () => CreateApartmentTypeDto })
  @ValidateNested()
  @Type(() => CreateApartmentTypeDto)
  declare data: CreateApartmentTypeDto;
}
