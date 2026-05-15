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
import { PartnersService } from './partners.service';
import { CreatePartnerRequest } from './dto/create-partner.dto';
import { UpdatePartnerRequest } from './dto/update-partner.dto';
import { SearchPartnersRequest } from './dto/search-partners.dto';

@ApiTags('partners')
@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new SEU partner' })
  async create(@Body() body: CreatePartnerRequest) {
    const partner = await this.partnersService.create(body.data);
    return ResponseBody.ok(partner);
  }

  @Public()
  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List partners with pagination and sort' })
  async findAll(@Body() body: SearchPartnersRequest) {
    const result = await this.partnersService.findAll(body.data, body.pagination, body.sort);
    return ResponseBody.paginated(result);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a single partner by id' })
  async findOne(@Param('id') id: string) {
    const partner = await this.partnersService.findOne(id);
    return ResponseBody.ok(partner);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a partner' })
  async update(@Param('id') id: string, @Body() body: UpdatePartnerRequest) {
    const partner = await this.partnersService.update(id, body.data);
    return ResponseBody.ok(partner);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a partner' })
  async remove(@Param('id') id: string) {
    const result = await this.partnersService.remove(id);
    return ResponseBody.ok(result);
  }
}
