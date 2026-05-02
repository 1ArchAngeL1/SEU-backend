import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateFloorDto {
  @ApiPropertyOptional({ description: 'Identifier of the floor image asset (e.g. CDN/storage id)' })
  @IsOptional()
  @IsString()
  floorImageId?: string;
}
