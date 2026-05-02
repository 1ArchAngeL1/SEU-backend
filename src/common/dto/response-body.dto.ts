import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { PaginatedResult } from '../interfaces/paginated-result.interface';

export class ResponsePagination {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  totalPages: number;
}

export class ResponseBody<T> {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  timestamp: string;

  @ApiPropertyOptional({ type: () => ResponsePagination })
  pagination?: ResponsePagination;

  data: T;

  static ok<T>(data: T, pagination?: ResponsePagination): ResponseBody<T> {
    const body = new ResponseBody<T>();
    body.success = true;
    body.timestamp = new Date().toISOString();
    body.data = data;
    if (pagination) body.pagination = pagination;
    return body;
  }

  static paginated<T>(result: PaginatedResult<T>): ResponseBody<T[]> {
    const { data, page, limit, total, totalPages } = result;
    return ResponseBody.ok(data, { page, limit, total, totalPages });
  }
}
