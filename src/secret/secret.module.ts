import { TypeOrmModule } from '@nestjs/typeorm';
import { Secret } from './entities/secret.entity';
import { Module } from '@nestjs/common';
import { SecretService } from './secret.service';
import { SecretController } from './secret.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Secret])],
  controllers: [SecretController],
  providers: [SecretService],
})
export class SecretModule {}
