import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, ValidateNested } from 'class-validator';

import { UnitStatus } from '../enums/unit.enums';
import { ReservationDto, SaleRecordDto } from './create-unit.dto';

export class StatusUpdateDto {
  @ApiProperty({ enum: UnitStatus })
  @IsEnum(UnitStatus)
  status: UnitStatus;

  @ApiPropertyOptional({ type: ReservationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ReservationDto)
  reservation?: ReservationDto;

  @ApiPropertyOptional({ type: SaleRecordDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SaleRecordDto)
  saleRecord?: SaleRecordDto;
}
