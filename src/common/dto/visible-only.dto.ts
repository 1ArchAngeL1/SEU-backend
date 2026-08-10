import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

import { ToBoolean } from './to-boolean';

/**
 * Opt-in public-visibility flag for detail endpoints.
 *
 * Public pages pass `?visibleOnly=true` so a record hidden by the admin
 * "Active" switch — its own, its block's or its project's — reads as a 404.
 * Admin screens omit it and keep loading deactivated records for editing.
 */
export class VisibleOnlyDto {
  @ApiPropertyOptional({
    description:
      'Public site: 404 when the record, its block or its project is deactivated.',
  })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  visibleOnly?: boolean;
}
