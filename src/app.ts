import fastifyCors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import fastify from 'fastify';
import path from 'path';
import { Config } from './config/env';
import { errorHandler } from './server/plugins/errorHandler/errorHandler';
import systemRoutes from './server/routes/system';
import marvelRoutes from './server/routes/marvelRouter';
import tmdbExtractionRoutes from './server/routes/tmdbExtractionRouter';
import { Container } from './utils/Container';

declare module 'fastify' {
  interface FastifyInstance {
    // augment fastify instance with the config object types
    config: Config;
    tmdbExtractionService: unknown;
  }
}

export default async function createApp(container: Container) {
  const { logger } = container;
  const app = fastify({
    logger: logger as any,
    disableRequestLogging: true,
  });
  // CORS for browser clients (frontend dev server on different origin)
  app.register(fastifyCors, {
    origin: true,
    credentials: true,
  });
  // swagger
  const openapiPath = path.join(__dirname, 'swagger/marvel-api.yaml');
  app.register(fastifySwagger, {
    specification: {
      path: openapiPath,
      baseDir: __dirname,
    },
    mode: 'static',
  });

  app.register(fastifySwaggerUI, {
    routePrefix: 'swagger',
  });

  // Add services to fastify instance
  app.decorate('tmdbExtractionService', container.tmdbExtractionService);

  app.register(systemRoutes);
  app.register(marvelRoutes, { prefix: '/v1/marvel', marvelController: container.marvelController });
  app.register(tmdbExtractionRoutes, { prefix: '/v1/tmdb-extraction' });

  app.setErrorHandler(errorHandler as any);
  return app;
}
