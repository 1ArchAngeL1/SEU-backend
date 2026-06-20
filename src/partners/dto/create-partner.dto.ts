import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';

import { RequestBody } from '@/common/dto/request-body.dto';

export class CreatePartnerDto {
  @ApiProperty({ description: 'Name (English)' })
  @IsString()
  @IsNotEmpty()
  nameEn: string;

  @ApiProperty({ description: 'Name (Georgian)' })
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Address (English)' })
  @IsOptional()
  @IsString()
  addressEn?: string;

  @ApiPropertyOptional({ description: 'Address (Georgian)' })
  @IsOptional()
  @IsString()
  addressKa?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  facebookLink?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage?: number;
}

export class CreatePartnerRequest extends RequestBody<CreatePartnerDto> {
  @ApiProperty({ type: () => CreatePartnerDto })
  @ValidateNested()
  @Type(() => CreatePartnerDto)
  declare data: CreatePartnerDto;
}
