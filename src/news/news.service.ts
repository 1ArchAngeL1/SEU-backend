import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PaginationDto, SortDto } from '@/common/dto/request-body.dto';
import { PaginatedResult } from '@/common/interfaces/paginated-result.interface';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { NewsFilterDto } from './dto/search-news.dto';
import { News, NewsDocument } from './schemas/news.schema';

@Injectable()
export class NewsService {
  constructor(
    @InjectModel(News.name) private readonly newsModel: Model<NewsDocument>,
  ) {}

  async create(dto: CreateNewsDto): Promise<NewsDocument> {
    return this.newsModel.create(dto);
  }

  async findAll(
    filter?: NewsFilterDto,
    pagination?: PaginationDto,
    sort?: SortDto[],
  ): Promise<PaginatedResult<NewsDocument>> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (filter?.q) {
      query.$or = [
        { header: { $regex: filter.q, $options: 'i' } },
        { tags: { $regex: filter.q, $options: 'i' } },
      ];
    }

    const sortBy =
      sort && sort.length
        ? sort.reduce<Record<string, 1 | -1>>(
            (acc, s) => ({ ...acc, [s.field]: s.direction === 'desc' ? -1 : 1 }),
            {},
          )
        : { createdAt: -1 as -1 };

    const [data, total] = await Promise.all([
      this.newsModel.find(query).sort(sortBy).skip(skip).limit(limit).exec(),
      this.newsModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: string): Promise<NewsDocument> {
    const news = await this.newsModel.findById(id).exec();
    if (!news) throw new NotFoundException(`News '${id}' not found`);
    return news;
  }

  async update(id: string, dto: UpdateNewsDto): Promise<NewsDocument> {
    const updated = await this.newsModel
      .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .exec();
    if (!updated) throw new NotFoundException(`News '${id}' not found`);
    return updated;
  }

  async remove(id: string): Promise<{ deleted: true; id: string }> {
    const deleted = await this.newsModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException(`News '${id}' not found`);
    return { deleted: true, id };
  }
}
