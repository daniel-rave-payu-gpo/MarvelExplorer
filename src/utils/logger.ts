import pino from 'pino';
import { NodeEnv } from './config';

export interface LoggerOptions {
  name: string;
  level: string;
  environment: string;
  redact?: string[];
}

export function createLogger(loggerOptions: LoggerOptions) {
  const { name, level, environment, redact = [] } = loggerOptions;

  const transport =
    environment !== NodeEnv.development
      ? undefined
      : {
          targets: [
            {
              target: 'pino-pretty',
              level: 'debug',
              options: { destination: 1 },
            },
            {
              target: 'pino/file',
              level: 'debug',
              options: { destination: 'service.log' },
            },
          ],
        };

  return pino({
    name,
    level,
    redact,
    transport,
  });
}
