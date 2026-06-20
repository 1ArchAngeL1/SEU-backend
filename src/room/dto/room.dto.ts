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
  @ApiPropertyOptional({ description: 'Name (English)', example: 'Master Bedroom' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  nameEn?: string;

  @ApiPropertyOptional({ description: 'Name (Georgian)', example: 'სამთავრო საძინებელი' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  nameKa?: string;

  @ApiProperty({ enum: RoomType })
  @IsEnum(RoomType)
  type: RoomType;

  @ApiPropertyOptional({ description: 'Size in square meters' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  size?: number;

  @ApiPropertyOptional({ description: 'Description (English)' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  descriptionEn?: string;

  @ApiPropertyOptional({ description: 'Description (Georgian)' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  descriptionKa?: string;
}

export class SyncRoomsDto {
  @ApiProperty({ type: [RoomDto], description: 'Full list of rooms — replaces existing array' })
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => RoomDto)
  rooms: RoomDto[];
}
