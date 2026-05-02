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
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { ParseObjectIdPipe } from '@/common/pipes/parse-object-id.pipe';
import { SyncRoomsDto } from '@/room/dto/room.dto';
import { CreateUnitDto } from './dto/create-unit.dto';
import { QueryUnitDto } from './dto/query-unit.dto';
import { StatusUpdateDto } from './dto/status-update.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { UnitsService } from './units.service';

@ApiTags('units')
@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a unit (living, commerce, parking, or storage)' })
  create(@Body() dto: CreateUnitDto) {
    return this.unitsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List units with rich filtering and pagination' })
  findAll(@Query() query: QueryUnitDto) {
    return this.unitsService.findAll(query);
  }

  @Get('stats/by-project/:projectId')
  @ApiOperation({ summary: 'Aggregated stats for a project (status counts, pricing, etc.)' })
  stats(@Param('projectId', ParseObjectIdPipe) projectId: string) {
    return this.unitsService.statsByProject(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single unit by id' })
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.unitsService.findOne(id);
  }

  @Post(':id/view')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Increment unit view counter' })
  view(@Param('id', ParseObjectIdPipe) id: string) {
    return this.unitsService.incrementViewCount(id).then(() => ({ ok: true }));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a unit' })
  update(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: UpdateUnitDto) {
    return this.unitsService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update only status (with optional reservation/sale info)' })
  updateStatus(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: StatusUpdateDto) {
    return this.unitsService.updateStatus(id, dto);
  }

  @Put(':id/rooms')
  @ApiOperation({
    summary: 'Sync rooms for a unit — replaces the whole rooms array with the provided list',
  })
  syncRooms(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: SyncRoomsDto) {
    return this.unitsService.syncRooms(id, dto.rooms);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a unit' })
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.unitsService.remove(id);
  }
}
