import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '@/auth/decorators/public.decorator';
import { ResponseBody } from '@/common/dto/response-body.dto';
import { NewsService } from './news.service';
import { CreateNewsRequest } from './dto/create-news.dto';
import { UpdateNewsRequest } from './dto/update-news.dto';
import { SearchNewsRequest } from './dto/search-news.dto';

@ApiTags('news')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a news article' })
  async create(@Body() body: CreateNewsRequest) {
    const news = await this.newsService.create(body.data);
    return ResponseBody.ok(news);
  }

  @Public()
  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List news with pagination and sort' })
  async findAll(@Body() body: SearchNewsRequest) {
    const result = await this.newsService.findAll(body.data, body.pagination, body.sort);
    return ResponseBody.paginated(result);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a single news article by id' })
  async findOne(@Param('id') id: string) {
    const news = await this.newsService.findOne(id);
    return ResponseBody.ok(news);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a news article' })
  async update(@Param('id') id: string, @Body() body: UpdateNewsRequest) {
    const news = await this.newsService.update(id, body.data);
    return ResponseBody.ok(news);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a news article' })
  async remove(@Param('id') id: string) {
    const result = await this.newsService.remove(id);
    return ResponseBody.ok(result);
  }
}
