import { Logger } from 'pino';
import { Config } from '../config/env';
import { MarvelController } from '../server/controllers/MarvelController';
import { MarvelService } from '../server/services/MarvelService';
import { MarvelRepository } from '../repositories/MarvelRepository';
import { TMDBExtractionService } from '../server/services/TMDBExtractionService';
import { PrismaService } from '../db/prisma/prisma';
import { createLogger } from './logger';

export class Container {
  private constructor(
    public config: Config,
    public logger: Logger,
    public marvelController: MarvelController,
    public tmdbExtractionService: TMDBExtractionService,
    public prismaService: PrismaService,
  ) {}

  static async createContainer(config: Config): Promise<Container> {
    const logger = createLogger({
      name: process.env.NAME as string,
      level: process.env.LOG_LEVEL as string,
      environment: process.env.NODE_ENV as string,
    });

    // init prisma service
    const prismaService = new PrismaService(logger);
    await prismaService.connect();

    // init marvel repository and service
    const marvelRepository = new MarvelRepository(prismaService, logger);
    const marvelService = new MarvelService(logger, marvelRepository);
    const marvelController = new MarvelController(logger, marvelService);

    // init TMDB extraction service
    const tmdbExtractionService = new TMDBExtractionService(
      logger,
      marvelRepository,
      config.TMDB_ACCESS_TOKEN as string,
    );

    return new Container(config, logger, marvelController, tmdbExtractionService, prismaService);
  }
}
