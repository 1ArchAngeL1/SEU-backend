import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsMongoId, IsOptional, IsString, Min } from 'class-validator';

export class CreateFloorDto {
  @ApiProperty({ description: 'Building ObjectId this floor belongs to' })
  @IsMongoId()
  building: string;

  @ApiProperty({ description: 'Floor number (e.g. 1, 2, -1 for basement)' })
  @IsInt()
  @Min(-10)
  floorNumber: number;

  @ApiPropertyOptional({ description: 'Identifier of the floor image asset (e.g. CDN/storage id)' })
  @IsOptional()
  @IsString()
  floorImageId?: string;
}
