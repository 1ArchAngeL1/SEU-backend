import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';

export class PolygonPointDto {
  @ApiProperty({ description: 'X coordinate as percentage of image width (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  x: number;

  @ApiProperty({ description: 'Y coordinate as percentage of image height (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  y: number;
}
