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
import { ContactsService } from './contacts.service';
import { CreateContactRequest } from './dto/create-contact.dto';
import { SearchContactsRequest } from './dto/search-contacts.dto';
import { UpdateContactStatusRequest } from './dto/update-contact-status.dto';

@ApiTags('contacts')
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Submit a contact request from the website' })
  async create(@Body() body: CreateContactRequest) {
    const contact = await this.contactsService.create(body.data);
    return ResponseBody.ok(contact);
  }

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List contacts with filtering by status and pagination' })
  async findAll(@Body() body: SearchContactsRequest) {
    const result = await this.contactsService.findAll(body.data, body.pagination, body.sort);
    return ResponseBody.paginated(result);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a single contact by id' })
  async findOne(@Param('id') id: string) {
    const contact = await this.contactsService.findOne(id);
    return ResponseBody.ok(contact);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Toggle contact status (open/closed)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateContactStatusRequest,
  ) {
    const contact = await this.contactsService.updateStatus(id, body.data);
    return ResponseBody.ok(contact);
  }
}
