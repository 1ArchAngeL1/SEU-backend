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
import { LandingPartnersService } from './landing-partners.service';
import { CreateLandingPartnerRequest } from './dto/create-landing-partner.dto';
import { UpdateLandingPartnerRequest } from './dto/update-landing-partner.dto';
import { SearchLandingPartnersRequest } from './dto/search-landing-partners.dto';

@ApiTags('landing-partners')
@Controller('landing-partners')
export class LandingPartnersController {
  constructor(private readonly landingPartnersService: LandingPartnersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new landing partner' })
  async create(@Body() body: CreateLandingPartnerRequest) {
    const partner = await this.landingPartnersService.create(body.data);
    return ResponseBody.ok(partner);
  }

  @Public()
  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List landing partners with pagination and sort' })
  async findAll(@Body() body: SearchLandingPartnersRequest) {
    const result = await this.landingPartnersService.findAll(
      body.data,
      body.pagination,
      body.sort,
    );
    return ResponseBody.paginated(result);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a single landing partner by id' })
  async findOne(@Param('id') id: string) {
    const partner = await this.landingPartnersService.findOne(id);
    return ResponseBody.ok(partner);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a landing partner' })
  async update(@Param('id') id: string, @Body() body: UpdateLandingPartnerRequest) {
    const partner = await this.landingPartnersService.update(id, body.data);
    return ResponseBody.ok(partner);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a landing partner' })
  async remove(@Param('id') id: string) {
    const result = await this.landingPartnersService.remove(id);
    return ResponseBody.ok(result);
  }
}
