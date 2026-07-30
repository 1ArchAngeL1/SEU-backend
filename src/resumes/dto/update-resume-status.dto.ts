import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { RequestBody } from '@/common/dto/request-body.dto';
import { ResumeStatus } from '../enums/resume-status.enum';

export class UpdateResumeStatusDto {
  @ApiProperty({ enum: ResumeStatus })
  @IsEnum(ResumeStatus)
  status: ResumeStatus;
}

export class UpdateResumeStatusRequest extends RequestBody<UpdateResumeStatusDto> {
  @ApiProperty({ type: () => UpdateResumeStatusDto })
  @ValidateNested()
  @Type(() => UpdateResumeStatusDto)
  declare data: UpdateResumeStatusDto;
}
