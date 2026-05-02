import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';

import { LocalizedStringDto } from '../../common/types/localized-string';
import { RoomDto } from '../../room/dto/room.dto';
import { FurnishingStatus, UnitStatus, UnitType } from '../enums/unit.enums';

export class PriceDto {
  @ApiPropertyOptional({ default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerSqm?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  originalPrice?: number;
}

export class ReservationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reservedByName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  reservedByEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reservedByPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  reservedAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  reservationExpiresAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class SaleRecordDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  buyerName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  buyerEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  buyerPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  soldAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  finalPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  partnerBank?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contractNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateUnitDto {
  @ApiProperty()
  @IsMongoId()
  building: string;

  @ApiProperty({ description: 'Project (denormalized for fast project-level queries)' })
  @IsMongoId()
  project: string;

  @ApiProperty({ example: 'A-12-3' })
  @IsString()
  @Length(1, 50)
  unitNumber: string;

  @ApiProperty({ example: 'A' })
  @IsString()
  @Length(1, 20)
  block: string;

  @ApiProperty({
    description: 'Floor number within the building (the service resolves this to a Floor document)',
  })
  @IsInt()
  floorNumber: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  entrance?: string;

  @ApiPropertyOptional({ enum: UnitStatus })
  @IsOptional()
  @IsEnum(UnitStatus)
  status?: UnitStatus;

  @ApiProperty({ enum: UnitType })
  @IsEnum(UnitType)
  type: UnitType;

  @ApiPropertyOptional({ type: [RoomDto], default: [] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoomDto)
  rooms?: RoomDto[];

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  bedrooms?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  bathrooms?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  livingRooms?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  balconies?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  terraces?: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  totalSize: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  livableArea?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  balconySize?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  terraceSize?: number;

  @ApiProperty({ type: PriceDto })
  @ValidateNested()
  @Type(() => PriceDto)
  price: PriceDto;

  @ApiPropertyOptional({ enum: FurnishingStatus })
  @IsOptional()
  @IsEnum(FurnishingStatus)
  furnishingStatus?: FurnishingStatus;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mainImage?: string;

  @ApiPropertyOptional({ description: 'Floor plan / blueprint image (file uuid or url)' })
  @IsOptional()
  @IsString()
  planImage?: string;

  @ApiPropertyOptional({ description: '2D content (e.g. 2D floor plan asset id or url)' })
  @IsOptional()
  @IsString()
  twoDContent?: string;

  @ApiPropertyOptional({ description: '3D content (e.g. 3D model / virtual tour asset id or url)' })
  @IsOptional()
  @IsString()
  threeDContent?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  floorPlanImage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  videoTourUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  virtualTourUrl?: string;

  @ApiPropertyOptional({ type: LocalizedStringDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  description?: LocalizedStringDto;

  @ApiPropertyOptional({ type: ReservationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ReservationDto)
  reservation?: ReservationDto;

  @ApiPropertyOptional({ type: SaleRecordDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SaleRecordDto)
  saleRecord?: SaleRecordDto;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
