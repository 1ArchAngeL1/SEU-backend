import { ApiProperty, PartialType } from '@nestjs/swagger';

import { CreateProjectDto } from './create-project.dto';
import { RequestBody } from '@/common/dto/request-body.dto';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}

export class UpdateProjectRequest extends RequestBody<UpdateProjectDto> {
  @ApiProperty({ type: () => UpdateProjectDto })
  @ValidateNested()
  @Type(() => UpdateProjectDto)
  declare data: UpdateProjectDto;
}
