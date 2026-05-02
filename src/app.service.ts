import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInfo() {
    return {
      name: 'SEU Development API',
      version: '0.1.0',
      description: 'Backend for SEU Development — projects, buildings, units.',
      docs: '/api/docs',
    };
  }
}
