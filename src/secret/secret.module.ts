import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';

import { Secret, SecretSchema } from './schemas/secret.schema';
import { SecretService } from './secret.service';
import { SecretController } from './secret.controller';
import { CryptService } from './crypt/crypt.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Secret.name, schema: SecretSchema }]),
  ],
  controllers: [SecretController],
  providers: [SecretService, CryptService],
})
export class SecretModule {}
