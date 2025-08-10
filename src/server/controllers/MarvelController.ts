import { Logger } from 'pino';
import { MarvelService } from '../services/MarvelService';

export class MarvelController {
  private logger: Logger;
  private marvelService: MarvelService;

  constructor(logger: Logger, marvelService: MarvelService) {
    this.logger = logger;
    this.marvelService = marvelService;
  }

  async getMoviesPerActor(): Promise<{ statusCode: number; response: any }> {
    try {
      const result = await this.marvelService.getMoviesPerActor();

      return {
        statusCode: 200,
        response: result,
      };
    } catch (error) {
      this.logger.error({ error }, 'Error getting movies per actor');
      return {
        statusCode: 500,
        response: { error: 'Internal server error' },
      };
    }
  }

  async getActorsWithMultipleCharacters(): Promise<{ statusCode: number; response: any }> {
    try {
      const result = await this.marvelService.getActorsWithMultipleCharacters();

      return {
        statusCode: 200,
        response: result,
      };
    } catch (error) {
      this.logger.error({ error }, 'Error getting actors with multiple characters');
      return {
        statusCode: 500,
        response: { error: 'Internal server error' },
      };
    }
  }

  async getCharactersWithMultipleActors(): Promise<{ statusCode: number; response: any }> {
    try {
      const result = await this.marvelService.getCharactersWithMultipleActors();

      return {
        statusCode: 200,
        response: result,
      };
    } catch (error) {
      this.logger.error({ error }, 'Error getting characters with multiple actors');
      return {
        statusCode: 500,
        response: { error: 'Internal server error' },
      };
    }
  }
}
