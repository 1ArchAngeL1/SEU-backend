import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

import { RequestBody } from '@/common/dto/request-body.dto';

export class CreateNewsDto {
  @ApiProperty()
  @IsString()
  header: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  image?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class CreateNewsRequest extends RequestBody<CreateNewsDto> {
  @ApiProperty({ type: () => CreateNewsDto })
  @ValidateNested()
  @Type(() => CreateNewsDto)
  declare data: CreateNewsDto;
}
