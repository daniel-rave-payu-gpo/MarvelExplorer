import { FastifyInstance } from 'fastify';
import { IncomingMessage, Server, ServerResponse } from 'http';
import { Logger } from 'pino';
import createApp from './app';
import { Config } from './config/env';
import { Container } from './utils/Container';
import { getConfig } from './utils/config';

let server: Awaited<ReturnType<typeof createApp>>;

const start = async () => {
  const config = getConfig<Config>(Config);

  try {
    const container = await Container.createContainer(config);

    // Database health check
    const isHealthy = await container.prismaService.healthCheck();
    if (!isHealthy) {
      throw new Error('Database health check failed');
    }

    server = await createApp(container);
    await server.ready();

    await server.listen({
      host: '0.0.0.0',
      port: config.PORT,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
    process.exit(1);
  }
};

start();
