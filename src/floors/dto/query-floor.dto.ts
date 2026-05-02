import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsOptional } from 'class-validator';

export class QueryFloorDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  building?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  project?: string;
}
