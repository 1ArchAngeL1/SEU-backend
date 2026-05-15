import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { RequestBody } from '@/common/dto/request-body.dto';
import { ContactStatus } from '../enums/contact-status.enum';

export class ContactFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ enum: ContactStatus })
  @IsOptional()
  @IsEnum(ContactStatus)
  status?: ContactStatus;
}

export class SearchContactsRequest extends RequestBody<ContactFilterDto> {
  @ApiProperty({ type: () => ContactFilterDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ContactFilterDto)
  declare data: ContactFilterDto;
}
