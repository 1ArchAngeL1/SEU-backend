import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

import { RequestBody } from '@/common/dto/request-body.dto';

export class CreateLandingPartnerDto {
  @ApiProperty({ description: 'Name (English)' })
  @IsString()
  @IsNotEmpty()
  nameEn: string;

  @ApiProperty({ description: 'Name (Georgian)' })
  @IsString()
  @IsNotEmpty()
  nameKa: string;

  @ApiPropertyOptional({ description: 'Logo file id' })
  @IsOptional()
  @IsString()
  logoId?: string;

  @ApiPropertyOptional({ description: 'Website / external link' })
  @IsOptional()
  @IsString()
  websiteLink?: string;

  @ApiPropertyOptional({ description: 'Description (English)' })
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional({ description: 'Description (Georgian)' })
  @IsOptional()
  @IsString()
  descriptionKa?: string;
}

export class CreateLandingPartnerRequest extends RequestBody<CreateLandingPartnerDto> {
  @ApiProperty({ type: () => CreateLandingPartnerDto })
  @ValidateNested()
  @Type(() => CreateLandingPartnerDto)
  declare data: CreateLandingPartnerDto;
}
