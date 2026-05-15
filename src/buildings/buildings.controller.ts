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
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '@/auth/decorators/public.decorator';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { BuildingsService } from './buildings.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { QueryBuildingDto } from './dto/query-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';

@ApiTags('buildings')
@Controller('buildings')
export class BuildingsController {
  constructor(private readonly buildingsService: BuildingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a building inside a project' })
  create(@Body() dto: CreateBuildingDto) {
    return this.buildingsService.create(dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List buildings with filtering and pagination' })
  findAll(@Query() query: QueryBuildingDto) {
    return this.buildingsService.findAll(query);
  }

  @Public()
  @Get('by-project/:projectId')
  @ApiOperation({ summary: 'List all buildings within a project' })
  findByProject(@Param('projectId', ParseObjectIdPipe) projectId: string) {
    return this.buildingsService.findByProject(projectId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a single building by id' })
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.buildingsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a building' })
  update(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: UpdateBuildingDto) {
    return this.buildingsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a building' })
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.buildingsService.remove(id);
  }
}
