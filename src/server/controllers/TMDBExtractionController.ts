import { FastifyReply, FastifyRequest } from 'fastify';
import { Logger } from 'pino';
import { TMDBExtractionService } from '../services/TMDBExtractionService';
import { TMDBExtractionResult } from '../../dto/TMDBDataDto';

export class TMDBExtractionController {
  private logger: Logger;
  private tmdbExtractionService: TMDBExtractionService;

  constructor(logger: Logger, tmdbExtractionService: TMDBExtractionService) {
    this.logger = logger;
    this.tmdbExtractionService = tmdbExtractionService;
  }

  async extractAndStoreData(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    // Deprecated endpoint removed from router; keep method for potential internal use
    try {
      this.logger.info('Starting TMDB data import request (non-destructive)');
      const result: TMDBExtractionResult = await this.tmdbExtractionService.extractAndStoreData();
      await reply.send({ success: true, message: 'TMDB data import completed successfully', data: result });
    } catch (error) {
      this.logger.error({ error }, 'Error during TMDB data import');
      await reply.status(500).send({ success: false, message: 'Error during TMDB data import', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async replaceAndStoreData(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      this.logger.info('Starting TMDB data import request (destructive)');

      const result: TMDBExtractionResult = await this.tmdbExtractionService.replaceAndStoreData();

      await reply.send({
        success: true,
        message: 'TMDB data import completed successfully',
        data: {
          moviesProcessed: result.movies.length,
          actorsProcessed: result.actors.length,
          charactersProcessed: result.characters.length,
          movies: result.movies,
          actors: result.actors,
          characters: result.characters,
        },
      });
    } catch (error: any) {
      this.logger.error({ error }, 'Error during TMDB data import');
      const status = error?.response?.status || 500;
      const tmdbMessage = error?.response?.data?.status_message || error?.message || 'Unknown error';
      await reply.status(status).send({
        success: false,
        message: 'Error during TMDB data import',
        error: tmdbMessage,
      });
    }
  }

  async getExtractionData(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const extractionData = this.tmdbExtractionService.getExtractionData();

      await reply.send({
        success: true,
        data: extractionData,
      });
    } catch (error) {
      this.logger.error({ error }, 'Error getting extraction data');
      await reply.status(500).send({
        success: false,
        message: 'Error getting extraction data',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getStats(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const stats = await this.tmdbExtractionService.getStats();
      await reply.send(stats);
    } catch (error) {
      this.logger.error({ error }, 'Error getting aggregated statistics');
      await reply.status(500).send({ error: 'Internal server error' });
    }
  }
}
