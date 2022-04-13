import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SecretService } from './secret.service';
import { CreateSecretDto } from './dto/create-secret.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { Secret } from './schemas/secret.schema';

@Controller('secret')
export class SecretController {
  constructor(private readonly secretService: SecretService) {}

  @Post()
  @ApiOperation({
    summary: 'Add a new secret',
    description: '',
  })
  @ApiResponse({
    status: 200,
    description: 'successful operation',
    type: Secret,
  })
  @ApiResponse({
    status: 405,
    description: 'Invalid input',
  })
  async addSecret(@Body() createSecretDto: CreateSecretDto): Promise<Secret> {
    return await this.secretService.addSecret(createSecretDto);
  }

  @Get(':hash')
  @ApiOperation({
    summary: 'Find a secret by hash',
    description: 'Returns a single secret',
  })
  @ApiResponse({ status: 200, description: 'successful operation' })
  @ApiResponse({
    status: 404,
    description: 'Secret not found',
  })
  async getSecretByHash(@Param('hash') hash: string): Promise<Secret> {
    return await this.secretService.getSecretByHash(hash);
  }
}
