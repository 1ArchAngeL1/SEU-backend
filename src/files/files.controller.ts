import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { Public } from '@/auth/decorators/public.decorator';
import { ResponseBody } from '@/common/dto/response-body.dto';
import { FilesService } from './files.service';

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a file. Returns the generated uuid.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('file is required');
    const saved = await this.filesService.upload(file);
    return ResponseBody.ok({
      uuid: saved.uuid,
      originalName: saved.originalName,
      mimeType: saved.mimeType,
      size: saved.size,
    });
  }

  @Public()
  @Get(':uuid')
  @ApiOperation({ summary: 'Download a file by uuid' })
  async download(
    @Param('uuid') uuid: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { stream, metadata } = await this.filesService.download(uuid);

    res.set({
      'Content-Type': metadata.mimeType,
      'Content-Length': metadata.size,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(metadata.originalName)}"`,
    });

    return new StreamableFile(stream);
  }
}
