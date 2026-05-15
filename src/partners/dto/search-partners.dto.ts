import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { RequestBody } from '@/common/dto/request-body.dto';

export class PartnerFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string;
}

export class SearchPartnersRequest extends RequestBody<PartnerFilterDto> {
  @ApiProperty({ type: () => PartnerFilterDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PartnerFilterDto)
  declare data: PartnerFilterDto;
}
