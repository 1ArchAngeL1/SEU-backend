import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsOptional, IsString, ValidateNested } from 'class-validator';

import { RequestBody } from '@/common/dto/request-body.dto';

export class CreateContactDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;
}

export class CreateContactRequest extends RequestBody<CreateContactDto> {
  @ApiProperty({ type: () => CreateContactDto })
  @ValidateNested()
  @Type(() => CreateContactDto)
  declare data: CreateContactDto;
}
