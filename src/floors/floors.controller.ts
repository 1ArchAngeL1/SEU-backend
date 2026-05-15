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
import { CreateFloorDto } from './dto/create-floor.dto';
import { QueryFloorDto } from './dto/query-floor.dto';
import { UpdateFloorDto } from './dto/update-floor.dto';
import { FloorsService } from './floors.service';

@ApiTags('floors')
@Controller('floors')
export class FloorsController {
  constructor(private readonly floorsService: FloorsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a floor to a building' })
  create(@Body() dto: CreateFloorDto) {
    return this.floorsService.create(dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List floors, optionally filtered by building or project' })
  findAll(@Query() query: QueryFloorDto) {
    return this.floorsService.findAll(query);
  }

  @Public()
  @Get('by-building/:buildingId')
  @ApiOperation({ summary: 'List floors of a specific building' })
  findByBuilding(@Param('buildingId', ParseObjectIdPipe) buildingId: string) {
    return this.floorsService.findByBuilding(buildingId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a floor by id' })
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.floorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a floor (e.g. set floorImageId)' })
  update(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: UpdateFloorDto) {
    return this.floorsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a floor' })
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.floorsService.remove(id);
  }
}
