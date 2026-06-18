import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import { RequestBody } from '@/common/dto/request-body.dto';
import { CreateApartmentTypeDto } from './create-apartment-type.dto';

export class UpdateApartmentTypeDto extends PartialType(CreateApartmentTypeDto) {}

export class UpdateApartmentTypeRequest extends RequestBody<UpdateApartmentTypeDto> {
  @ApiProperty({ type: () => UpdateApartmentTypeDto })
  @ValidateNested()
  @Type(() => UpdateApartmentTypeDto)
  declare data: UpdateApartmentTypeDto;
}
