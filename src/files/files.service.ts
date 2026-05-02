import { randomUUID } from 'crypto';
import { createReadStream, ReadStream } from 'fs';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { join, resolve } from 'path';

import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { FileEntity, FileDocument } from './schemas/file.schema';

export interface DownloadResult {
  stream: ReadStream;
  metadata: FileDocument;
}

@Injectable()
export class FilesService implements OnModuleInit {
  private readonly storageDir: string;

  constructor(
    @InjectModel(FileEntity.name) private readonly fileModel: Model<FileDocument>,
    private readonly config: ConfigService,
  ) {
    const dir = this.config.get<string>('FILE_STORAGE_DIR', 'uploads');
    this.storageDir = resolve(process.cwd(), dir);
  }

  async onModuleInit(): Promise<void> {
    await mkdir(this.storageDir, { recursive: true });
  }

  async upload(file: Express.Multer.File): Promise<FileDocument> {
    const uuid = randomUUID();
    const storagePath = join(this.storageDir, uuid);

    await writeFile(storagePath, file.buffer);

    try {
      return await this.fileModel.create({
        uuid,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        storagePath,
      });
    } catch (err) {
      await unlink(storagePath).catch(() => undefined);
      throw err;
    }
  }

  async download(uuid: string): Promise<DownloadResult> {
    const metadata = await this.fileModel.findOne({ uuid }).exec();
    if (!metadata) throw new NotFoundException(`File '${uuid}' not found`);

    const stream = createReadStream(metadata.storagePath);
    return { stream, metadata };
  }
}
