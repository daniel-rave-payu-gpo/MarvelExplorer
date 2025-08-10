import { PoolConfig } from 'pg';

export const Config = {
  postgres: {
    get connection(): PoolConfig {
      return {
        host: process.env.POSTGRES_HOST || 'localhost',
        user: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || 'password',
        port: +(process.env.POSTGRES_PORT || 5432),
        database: this.dbConfig.dbName,
      };
    },
    get dbConfig() {
      return {
        dbName: process.env.DB_NAME || 'postgres',
        petsTableName: process.env.PETS_TABLE_NAME || 'pets',
      };
    },
  },
} as const;
