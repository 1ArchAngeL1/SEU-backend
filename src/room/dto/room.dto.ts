import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';

import { RoomType } from '../enums/room.enums';

export class RoomDto {
  @ApiProperty({ example: 'Master Bedroom' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({ enum: RoomType })
  @IsEnum(RoomType)
  type: RoomType;

  @ApiPropertyOptional({ description: 'Size in square meters' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  size?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;
}

export class SyncRoomsDto {
  @ApiProperty({ type: [RoomDto], description: 'Full list of rooms — replaces existing array' })
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => RoomDto)
  rooms: RoomDto[];
}
