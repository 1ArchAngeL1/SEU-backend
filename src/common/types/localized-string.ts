import { Prop, Schema } from '@nestjs/mongoose';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

@Schema({ _id: false })
export class LocalizedString {
  @Prop({ trim: true })
  ka?: string;

  @Prop({ trim: true })
  en?: string;
}

export class LocalizedStringDto {
  @ApiPropertyOptional({ description: 'Georgian' })
  @IsOptional()
  @IsString()
  ka?: string;

  @ApiPropertyOptional({ description: 'English' })
  @IsOptional()
  @IsString()
  en?: string;
}

export type LocaleKey = 'ka' | 'en';

export function pickLocale(value: LocalizedString | undefined, locale: LocaleKey = 'en'): string {
  if (!value) return '';
  return value[locale] ?? value.en ?? value.ka ?? '';
}
