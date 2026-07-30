import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';

import { RequestBody } from '@/common/dto/request-body.dto';

export class CreateResumeDto {
  @ApiProperty({ description: 'UUID of the uploaded résumé file.' })
  @IsString()
  fileId: string;

  @ApiProperty({ description: 'Original filename of the uploaded résumé.' })
  @IsString()
  fileName: string;

  @ApiPropertyOptional({ description: 'Position the applicant is applying for.' })
  @IsOptional()
  @IsString()
  position?: string;
}

export class CreateResumeRequest extends RequestBody<CreateResumeDto> {
  @ApiProperty({ type: () => CreateResumeDto })
  @ValidateNested()
  @Type(() => CreateResumeDto)
  declare data: CreateResumeDto;
}
