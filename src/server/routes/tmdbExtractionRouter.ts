import { FastifyInstance } from 'fastify';
import { TMDBExtractionController } from '../controllers/TMDBExtractionController';

export default async function tmdbExtractionRouter(fastify: FastifyInstance): Promise<void> {
  const tmdbExtractionController = new TMDBExtractionController(fastify.log as any, fastify.tmdbExtractionService as any);

  // Import and store TMDB data for specified movies and actors (destructive import)
  fastify.post('/import', tmdbExtractionController.replaceAndStoreData.bind(tmdbExtractionController));

  // Get the extraction data configuration
  fastify.get('/extraction-data', tmdbExtractionController.getExtractionData.bind(tmdbExtractionController));

  // Get aggregated statistics under tmdb-extraction
  fastify.get('/stats', tmdbExtractionController.getStats.bind(tmdbExtractionController));
}
