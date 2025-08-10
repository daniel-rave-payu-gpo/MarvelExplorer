import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { StatusCodes } from 'http-status-codes';

const descriptionMap = {
  OPERATIONAL: 'The service is fully operational',
  DEGRADED: 'The service is partially operational',
  NON_OPERATIONAL: 'The service is non-operational',
};

export default function systemRoutes(fastify: FastifyInstance, options: FastifyPluginOptions, done: () => void): void {
  fastify.get('/health', (req, reply) => {
    reply.status(StatusCodes.OK).send({
      status: 'OPERATIONAL',
      description: descriptionMap.OPERATIONAL,
    });
  });

  done();
}
