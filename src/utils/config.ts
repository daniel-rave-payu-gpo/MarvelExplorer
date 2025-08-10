import { TObject } from '@sinclair/typebox';
import envSchema from 'env-schema';
import { Environment as envTypes } from 'env-types';

export enum LogLevel {
  info = 'info',
  warn = 'warn',
  error = 'error',
}

export enum NodeEnv {
  production = 'production',
  development = 'development',
}

export function getConfig<T>(config: TObject): T {
  // convert environment variables to their typed counterparts
  const { ...env } = envTypes.load();

  // validate environment variables
  return envSchema({ schema: config, data: env });
}
