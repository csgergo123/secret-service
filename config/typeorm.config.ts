import * as config from 'config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const dbConfig = config.get('db');

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: dbConfig.type,
  url: `mongodb+srv://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}/${dbConfig.database}?retryWrites=true&w=majority`,
  entities: ['dist/**/*{.ts,.js}'],
  migrations: ['src/migration/**/*.ts'],
  synchronize: dbConfig.synchronize,
  namingStrategy: new SnakeNamingStrategy(),
};
