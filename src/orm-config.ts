import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export const config: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'mediumclone',
  password: '123',
  database: 'mediumclone',
  entities: ['dist/**/*.entity.js'],
  synchronize: false,
  migrations: ['dist/migrations/*.js'],
};

const dataSource = new DataSource(config as DataSourceOptions);

export default dataSource;
