import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsMongoId,
  IsOptional,
  ValidateNested,
} from 'class-validator';

import { RequestBody } from '@/common/dto/request-body.dto';

export class ApartmentTypeFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  project?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  bedrooms?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}

export class SearchApartmentTypesRequest extends RequestBody<ApartmentTypeFilterDto> {
  @ApiProperty({ type: () => ApartmentTypeFilterDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ApartmentTypeFilterDto)
  declare data: ApartmentTypeFilterDto;
}
