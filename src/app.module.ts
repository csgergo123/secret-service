import * as config from 'config';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SecretModule } from './secret/secret.module';

const dbConfig = config.get('db');
@Module({
  imports: [
    MongooseModule.forRoot(
      `mongodb+srv://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}/${dbConfig.database}?retryWrites=true&w=majority`,
    ),
    SecretModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
