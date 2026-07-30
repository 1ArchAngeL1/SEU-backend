import {
  Body,
  Controller,
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
import { ResumesService } from './resumes.service';
import { CreateResumeRequest } from './dto/create-resume.dto';
import { SearchResumesRequest } from './dto/search-resumes.dto';
import { UpdateResumeStatusRequest } from './dto/update-resume-status.dto';

@ApiTags('resumes')
@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Submit a résumé (job application) from the website' })
  async create(@Body() body: CreateResumeRequest) {
    const resume = await this.resumesService.create(body.data);
    return ResponseBody.ok(resume);
  }

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List résumés with filtering by status and pagination' })
  async findAll(@Body() body: SearchResumesRequest) {
    const result = await this.resumesService.findAll(body.data, body.pagination, body.sort);
    return ResponseBody.paginated(result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single résumé by id' })
  async findOne(@Param('id') id: string) {
    const resume = await this.resumesService.findOne(id);
    return ResponseBody.ok(resume);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update résumé status (new/reviewed)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateResumeStatusRequest,
  ) {
    const resume = await this.resumesService.updateStatus(id, body.data);
    return ResponseBody.ok(resume);
  }
}