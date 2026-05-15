import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { RequestBody } from '@/common/dto/request-body.dto';
import { ContactStatus } from '../enums/contact-status.enum';

export class UpdateContactStatusDto {
  @ApiProperty({ enum: ContactStatus })
  @IsEnum(ContactStatus)
  status: ContactStatus;
}

export class UpdateContactStatusRequest extends RequestBody<UpdateContactStatusDto> {
  @ApiProperty({ type: () => UpdateContactStatusDto })
  @ValidateNested()
  @Type(() => UpdateContactStatusDto)
  declare data: UpdateContactStatusDto;
}
