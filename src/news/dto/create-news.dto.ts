import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

import { RequestBody } from '@/common/dto/request-body.dto';

export class CreateNewsDto {
  @ApiProperty({ description: 'Header (English)' })
  @IsString()
  @IsNotEmpty()
  headerEn: string;

  @ApiProperty({ description: 'Header (Georgian)' })
  @IsString()
  @IsNotEmpty()
  headerKa: string;

  @ApiProperty({ description: 'Description (English)' })
  @IsString()
  @IsNotEmpty()
  descriptionEn: string;

  @ApiProperty({ description: 'Description (Georgian)' })
  @IsString()
  @IsNotEmpty()
  descriptionKa: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  image?: string[];

  @ApiPropertyOptional({ description: 'Article video — file id or URL' })
  @IsOptional()
  @IsString()
  video?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    default: false,
    description: 'Show this article as the wide main banner on the news page (only one can be main)',
  })
  @IsOptional()
  @IsBoolean()
  isMain?: boolean;
}

export class CreateNewsRequest extends RequestBody<CreateNewsDto> {
  @ApiProperty({ type: () => CreateNewsDto })
  @ValidateNested()
  @Type(() => CreateNewsDto)
  declare data: CreateNewsDto;
}
