import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { RequestBody } from '@/common/dto/request-body.dto';

export class LandingPartnerFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string;
}

export class SearchLandingPartnersRequest extends RequestBody<LandingPartnerFilterDto> {
  @ApiProperty({ type: () => LandingPartnerFilterDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LandingPartnerFilterDto)
  declare data: LandingPartnerFilterDto;
}
