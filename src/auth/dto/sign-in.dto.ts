import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class SignInDto {
  @ApiProperty({ type: String })
  @Type(() => String)
  @IsString()
  username: string;

  @ApiProperty({ type: String })
  @Type(() => String)
  @IsString()
  password: string;
}
