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
import { ParseObjectIdPipe } from '@/common/pipes/parse-object-id.pipe';
import { ApartmentTypesService } from './apartment-types.service';
import { CreateApartmentTypeRequest } from './dto/create-apartment-type.dto';
import { SearchApartmentTypesRequest } from './dto/search-apartment-type.dto';
import { UpdateApartmentTypeRequest } from './dto/update-apartment-type.dto';

@ApiTags('apartment-types')
@Controller('apartment-types')
export class ApartmentTypesController {
  constructor(private readonly apartmentTypesService: ApartmentTypesService) {}

  @Post()
  @ApiOperation({ summary: 'Create an apartment type (admin)' })
  async create(@Body() body: CreateApartmentTypeRequest) {
    const apartmentType = await this.apartmentTypesService.create(body.data);
    return ResponseBody.ok(apartmentType);
  }

  @Public()
  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List apartment types with filtering, pagination, and sort in body' })
  async findAll(@Body() body: SearchApartmentTypesRequest) {
    const result = await this.apartmentTypesService.findAll(
      body.data,
      body.pagination,
      body.sort,
    );
    return ResponseBody.paginated(result);
  }

  @Public()
  @Get('by-project/:projectId')
  @ApiOperation({ summary: 'List all apartment types for a given project' })
  async findByProject(@Param('projectId', ParseObjectIdPipe) projectId: string) {
    const result = await this.apartmentTypesService.findByProject(projectId);
    return ResponseBody.ok(result);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a single apartment type by id' })
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    const apartmentType = await this.apartmentTypesService.findOne(id);
    return ResponseBody.ok(apartmentType);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an apartment type (admin)' })
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() body: UpdateApartmentTypeRequest,
  ) {
    const apartmentType = await this.apartmentTypesService.update(id, body.data);
    return ResponseBody.ok(apartmentType);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an apartment type (admin)' })
  async remove(@Param('id', ParseObjectIdPipe) id: string) {
    const result = await this.apartmentTypesService.remove(id);
    return ResponseBody.ok(result);
  }
}
