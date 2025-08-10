import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { CustomError } from '../../../utils/errors';

export async function errorHandler(err: FastifyError, req: FastifyRequest, reply: FastifyReply) {
  if (reply.statusCode === StatusCodes.BAD_REQUEST) {
    return reply.status(StatusCodes.BAD_REQUEST).send({ message: err.message });
  }

  if (err instanceof CustomError) {
    return reply.status(err.statusCode).send({ message: err.message });
  }

  if (err.statusCode && err.statusCode < StatusCodes.INTERNAL_SERVER_ERROR) {
    return reply.status(StatusCodes.BAD_REQUEST).send({ message: err.message });
  }

  req.log.error(err);
  reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'Internal Server Error' });
}
