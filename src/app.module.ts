import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from 'config/typeorm.config';
import { SecretModule } from './secret/secret.module';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), SecretModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
