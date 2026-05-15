import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';

import { RequestBody } from '@/common/dto/request-body.dto';

export class CreatePartnerDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

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
