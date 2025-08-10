import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { MarvelController } from '../controllers/MarvelController';
import type { operations } from '../../types/generated-api';

interface MarvelRouterOpts extends FastifyPluginOptions {
  marvelController: MarvelController;
}

type GetMoviesPerActorRoute = {
  Reply: operations['getMoviesPerActor']['responses']['200']['content']['application/json'];
};

type GetActorsWithMultipleCharactersRoute = {
  Reply: operations['getActorsWithMultipleCharacters']['responses']['200']['content']['application/json'];
};

type GetCharactersWithMultipleActorsRoute = {
  Reply: operations['getCharactersWithMultipleActors']['responses']['200']['content']['application/json'];
};

export default function marvelRouter(fastify: FastifyInstance, options: MarvelRouterOpts, done: () => void): void {
  const marvelController = options.marvelController;
  fastify.get<GetMoviesPerActorRoute>('/moviesPerActor', async (req, reply) => {
    try {
      const result = await marvelController.getMoviesPerActor();
      reply.statusCode = result.statusCode;
      reply.send(result.response);
    } catch (error) {
      (fastify.log as any).error({ error }, 'Error in moviesPerActor endpoint');
      reply.statusCode = 500;
      reply.send({ error: 'Internal server error' } as any);
    }
  });

  fastify.get<GetActorsWithMultipleCharactersRoute>('/actorsWithMultipleCharacters', async (req, reply) => {
    try {
      const result = await marvelController.getActorsWithMultipleCharacters();
      reply.statusCode = result.statusCode;
      reply.send(result.response);
    } catch (error) {
      (fastify.log as any).error({ error }, 'Error in actorsWithMultipleCharacters endpoint');
      reply.statusCode = 500;
      reply.send({ error: 'Internal server error' } as any);
    }
  });

  fastify.get<GetCharactersWithMultipleActorsRoute>('/charactersWithMultipleActors', async (req, reply) => {
    try {
      const result = await marvelController.getCharactersWithMultipleActors();
      reply.statusCode = result.statusCode;
      reply.send(result.response);
    } catch (error) {
      (fastify.log as any).error({ error }, 'Error in charactersWithMultipleActors endpoint');
      reply.statusCode = 500;
      reply.send({ error: 'Internal server error' } as any);
    }
  });

  done();
}
