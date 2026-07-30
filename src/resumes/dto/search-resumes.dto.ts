import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { RequestBody } from '@/common/dto/request-body.dto';
import { ResumeStatus } from '../enums/resume-status.enum';

export class ResumeFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ enum: ResumeStatus })
  @IsOptional()
  @IsEnum(ResumeStatus)
  status?: ResumeStatus;
}

export class SearchResumesRequest extends RequestBody<ResumeFilterDto> {
  @ApiProperty({ type: () => ResumeFilterDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ResumeFilterDto)
  declare data: ResumeFilterDto;
}
