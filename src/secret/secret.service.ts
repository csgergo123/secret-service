import { MongoRepository } from 'typeorm';

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Secret } from './entities/secret.entity';
import { CreateSecretDto } from './dto/create-secret.dto';

@Injectable()
export class SecretService {
  private logger = new Logger('SecretService');

  constructor(
    @InjectRepository(Secret)
    private readonly secretRepository: MongoRepository<Secret>,
  ) {}

  async addSecret(createSecretDto: CreateSecretDto): Promise<Secret> {
    const now = new Date();
    const expiresAt = now.setSeconds(
      now.getSeconds() + createSecretDto.expireAfter,
    );

    try {
      let secret = this.secretRepository.create({
        secretText: createSecretDto.secret,
        remainingViews: createSecretDto.expireAfterViews,
        expiresAt,
      });
      secret = await this.secretRepository.save(secret);
      this.logger.log(`Secret ${createSecretDto.secret} created.`);
      return secret;
    } catch (error) {
      this.logger.error(
        `Failed to create secret ${JSON.stringify(createSecretDto)}.`,
        error,
      );
      throw new Error(error);
    }
  }
}
