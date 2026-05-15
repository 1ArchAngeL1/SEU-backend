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
import { ProjectsService } from './projects.service';
import { CreateProjectRequest } from '@/projects/dto/create-project.dto';
import { UpdateProjectRequest } from '@/projects/dto/update-project.dto';
import { SearchProjectsRequest } from '@/projects/dto/project-filter.dto';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a project (neighborhood, e.g. SEU Varketili)' })
  async create(@Body() body: CreateProjectRequest) {
    const project = await this.projectsService.create(body.data);
    return ResponseBody.ok(project);
  }

  @Public()
  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List projects with filtering, pagination, and sort in body' })
  async findAll(@Body() body: SearchProjectsRequest) {
    const result = await this.projectsService.findAll(body.data, body.pagination, body.sort);
    return ResponseBody.paginated(result);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a single project by id' })
  async findOne(@Param('id') id: string) {
    const project = await this.projectsService.findOne(id);
    return ResponseBody.ok(project);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project' })
  async update(@Param('id') id: string, @Body() body: UpdateProjectRequest) {
    const project = await this.projectsService.update(id, body.data);
    return ResponseBody.ok(project);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a project' })
  async remove(@Param('id') id: string) {
    const result = await this.projectsService.remove(id);
    return ResponseBody.ok(result);
  }
}
