import { Static, Type } from '@sinclair/typebox';
import { LogLevel, NodeEnv } from '../utils/config';

const Config = Type.Strict(
  Type.Object({
    // app
    NAME: Type.String(),
    PORT: Type.Number({ minimum: 3000, maximum: 65535 }),
    LOG_LEVEL: Type.Enum(LogLevel),
    NODE_ENV: Type.Enum(NodeEnv, { default: NodeEnv.production }),
    // Graceful shutdown
    INITIAL_DELAY_MS: Type.Number(),

    // Database
    DATABASE_URL: Type.String({ default: 'postgresql://postgres:password@localhost:5432/marvel_explorer' }),
    POSTGRES_HOST: Type.String({ default: 'localhost' }),
    POSTGRES_PORT: Type.Number({ default: 5432 }),
    POSTGRES_DB: Type.String({ default: 'marvel_explorer' }),
    POSTGRES_USER: Type.String({ default: 'postgres' }),
    POSTGRES_PASSWORD: Type.String({ default: 'password' }),

    // TMDB
    TMDB_ACCESS_TOKEN: Type.String(),
  }),
);

type Config = Static<typeof Config>;

export { Config };
