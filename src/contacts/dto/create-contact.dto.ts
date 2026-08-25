import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { RequestBody } from '@/common/dto/request-body.dto';

export class CreateContactDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Unit the request was sent from, when submitted from an apartment page',
  })
  @IsOptional()
  @IsMongoId()
  unit?: string;
}

export class CreateContactRequest extends RequestBody<CreateContactDto> {
  @ApiProperty({ type: () => CreateContactDto })
  @ValidateNested()
  @Type(() => CreateContactDto)
  declare data: CreateContactDto;
}
