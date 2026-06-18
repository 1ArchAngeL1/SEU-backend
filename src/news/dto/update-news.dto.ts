import { ApiProperty, PartialType } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { CreateNewsDto } from './create-news.dto';
import { RequestBody } from '@/common/dto/request-body.dto';

export class UpdateNewsDto extends PartialType(CreateNewsDto) {}

export class UpdateNewsRequest extends RequestBody<UpdateNewsDto> {
  @ApiProperty({ type: () => UpdateNewsDto })
  @ValidateNested()
  @Type(() => UpdateNewsDto)
  declare data: UpdateNewsDto;
}
