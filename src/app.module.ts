import * as config from 'config';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SecretModule } from './secret/secret.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ContentInterceptor } from './common/interceptor/content.interceptor';

const dbConfig = config.get('db');
@Module({
  imports: [
    MongooseModule.forRoot(
      `mongodb+srv://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}/${dbConfig.database}?retryWrites=true&w=majority`,
    ),
    SecretModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ContentInterceptor,
    },
  ],
})
export class AppModule {}
