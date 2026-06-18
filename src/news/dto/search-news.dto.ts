import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { RequestBody } from '@/common/dto/request-body.dto';

export class NewsFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string;
}

export class SearchNewsRequest extends RequestBody<NewsFilterDto> {
  @ApiProperty({ type: () => NewsFilterDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => NewsFilterDto)
  declare data: NewsFilterDto;
}
