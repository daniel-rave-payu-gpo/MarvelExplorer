import { Logger } from 'pino';
import { PrismaService } from '../db/prisma/prisma';
import { Movie as DbMovie, Actor as DbActor, Character as DbCharacter } from '@prisma/client';

export class MarvelRepository {
  private prismaService: PrismaService;
  private logger: Logger;

  constructor(prismaService: PrismaService, logger: Logger) {
    this.prismaService = prismaService;
    this.logger = logger;
  }

  // Basic data access methods
  async countMovies(): Promise<number> {
    try {
      return await this.prismaService.client.movie.count();
    } catch (error) {
      this.logger.error({ error }, 'Error counting movies');
      throw error;
    }
  }

  async countActors(): Promise<number> {
    try {
      return await this.prismaService.client.actor.count();
    } catch (error) {
      this.logger.error({ error }, 'Error counting actors');
      throw error;
    }
  }

  async countCharacters(): Promise<number> {
    try {
      return await this.prismaService.client.character.count();
    } catch (error) {
      this.logger.error({ error }, 'Error counting characters');
      throw error;
    }
  }

  // Methods needed by TMDBExtractionService
  async saveMovie(movie: {
    id: number;
    title: string;
    release_date: string | null;
    overview: string | null;
    poster_path: string | null;
  }): Promise<DbMovie> {
    try {
      return await this.prismaService.client.movie.upsert({
        where: { tmdbId: movie.id },
        update: {
          title: movie.title,
          releaseDate: movie.release_date ? new Date(movie.release_date) : null,
          overview: movie.overview,
          posterPath: movie.poster_path,
        },
        create: {
          tmdbId: movie.id,
          title: movie.title,
          releaseDate: movie.release_date ? new Date(movie.release_date) : null,
          overview: movie.overview,
          posterPath: movie.poster_path,
        },
      });
    } catch (error) {
      this.logger.error({ error, movie }, 'Error saving movie');
      throw error;
    }
  }

  async saveActor(actor: {
    id: number;
    name: string;
    profile_path: string | null;
  }): Promise<DbActor> {
    try {
      return await this.prismaService.client.actor.upsert({
        where: { tmdbId: actor.id },
        update: {
          name: actor.name,
          profilePath: actor.profile_path,
        },
        create: {
          tmdbId: actor.id,
          name: actor.name,
          profilePath: actor.profile_path,
        },
      });
    } catch (error) {
      this.logger.error({ error, actor }, 'Error saving actor');
      throw error;
    }
  }

  async saveCharacter(character: {
    id: number;
    name: string;
    movie_id: number;
    actor_id: number;
  }): Promise<DbCharacter> {
    try {
      return await this.prismaService.client.character.create({
        data: {
          name: character.name,
          movieId: character.movie_id,
          actorId: character.actor_id,
        },
      });
    } catch (error) {
      this.logger.error({ error, character }, 'Error saving character');
      throw error;
    }
  }

  // Clear methods needed by TMDBExtractionService
  async clearAllCharacters(): Promise<void> {
    try {
      await this.prismaService.client.character.deleteMany({});
    } catch (error) {
      this.logger.error({ error }, 'Error clearing all characters');
      throw error;
    }
  }

  async clearAllMovies(): Promise<void> {
    try {
      await this.prismaService.client.movie.deleteMany({});
    } catch (error) {
      this.logger.error({ error }, 'Error clearing all movies');
      throw error;
    }
  }

  async clearAllActors(): Promise<void> {
    try {
      await this.prismaService.client.actor.deleteMany({});
    } catch (error) {
      this.logger.error({ error }, 'Error clearing all actors');
      throw error;
    }
  }

  // Stats method needed by TMDBExtractionService
  async getStats(): Promise<any> {
    try {
      const movieCount = await this.countMovies();
      const actorCount = await this.countActors();
      const characterCount = await this.countCharacters();

      return {
        movies: movieCount,
        actors: actorCount,
        characters: characterCount,
      };
    } catch (error) {
      this.logger.error({ error }, 'Error getting stats');
      throw error;
    }
  }

  // Methods needed by MarvelService
  async getMoviesPerActor(): Promise<any[]> {
    try {
      return await this.prismaService.client.actor.findMany({
        include: {
          characters: {
            include: {
              movie: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      this.logger.error({ error }, 'Error getting movies per actor');
      throw error;
    }
  }

  async getActorsWithMultipleCharacters(): Promise<any> {
    try {
      // First get all actors with their character counts
      const actorsWithCounts = await this.prismaService.client.actor.findMany({
        include: {
          _count: {
            select: {
              characters: true,
            },
          },
        },
      });

      // Filter actors with multiple characters and get their full data
      const actorsWithMultipleCharacters = actorsWithCounts
        .filter(actor => actor._count.characters > 1)
        .map(actor => ({
          id: actor.id,
          name: actor.name,
          characterCount: actor._count.characters,
        }));

      // Get full character data for these actors
      const result = await Promise.all(
        actorsWithMultipleCharacters.map(async (actor) => {
          const characters = await this.prismaService.client.character.findMany({
            where: {
              actorId: actor.id,
            },
            include: {
              movie: true,
            },
          });

          return {
            ...actor,
            characters,
          };
        })
      );

      return {
        data: result,
      };
    } catch (error) {
      this.logger.error({ error }, 'Error getting actors with multiple characters');
      throw error;
    }
  }

  async getMoviesByYear(): Promise<Array<{ releaseDate: Date | null; _count: number }>> {
    try {
      const result = await this.prismaService.client.movie.groupBy({
        by: ['releaseDate'],
        _count: true,
        orderBy: {
          releaseDate: 'asc',
        },
      });
      return result as Array<{ releaseDate: Date | null; _count: number }>;
    } catch (error) {
      this.logger.error({ error }, 'Error getting movies by year');
      throw error;
    }
  }

  async getActorsWithCharacters(): Promise<any[]> {
    try {
      return await this.prismaService.client.actor.findMany({
        where: {
          characters: {
            some: {},
          },
        },
        include: {
          characters: true,
        },
      });
    } catch (error) {
      this.logger.error({ error }, 'Error getting actors with characters');
      throw error;
    }
  }

  async getCharactersWithMultipleActors(): Promise<Array<{ name: string; _count: number }>> {
    try {
      const result = await this.prismaService.client.character.groupBy({
        by: ['name'],
        _count: true,
        having: {
          name: {
            _count: {
              gt: 1,
            },
          },
        },
      });
      return result as Array<{ name: string; _count: number }>;
    } catch (error) {
      this.logger.error({ error }, 'Error getting characters with multiple actors');
      throw error;
    }
  }

  async upsertMovie(movie: {
    tmdbId: number;
    title: string;
    releaseDate: Date | null;
    overview: string | null;
    posterPath: string | null;
  }): Promise<DbMovie> {
    try {
      return await this.prismaService.client.movie.upsert({
        where: { tmdbId: movie.tmdbId },
        update: {
          title: movie.title,
          releaseDate: movie.releaseDate,
          overview: movie.overview,
          posterPath: movie.posterPath,
        },
        create: {
          tmdbId: movie.tmdbId,
          title: movie.title,
          releaseDate: movie.releaseDate,
          overview: movie.overview,
          posterPath: movie.posterPath,
        },
      });
    } catch (error) {
      this.logger.error({ error, movie }, 'Error upserting movie');
      throw error;
    }
  }

  async upsertActor(actor: {
    tmdbId: number;
    name: string;
    profilePath: string | null;
  }): Promise<DbActor> {
    try {
      return await this.prismaService.client.actor.upsert({
        where: { tmdbId: actor.tmdbId },
        update: {
          name: actor.name,
          profilePath: actor.profilePath,
        },
        create: {
          tmdbId: actor.tmdbId,
          name: actor.name,
          profilePath: actor.profilePath,
        },
      });
    } catch (error) {
      this.logger.error({ error, actor }, 'Error upserting actor');
      throw error;
    }
  }

  async upsertCharacter(character: {
    name: string;
    movieId: number;
    actorId: number;
    normalizedName: string;
    canonicalKey: string;
  }): Promise<DbCharacter> {
    try {
      // Use raw SQL or type assertion to handle the custom fields
      const result = await this.prismaService.client.character.upsert({
        where: {
          movieId_actorId_name: {
            movieId: character.movieId,
            actorId: character.actorId,
            name: character.name,
          },
        },
        update: {
          // Use type assertion for custom fields
          ...(character as any),
        },
        create: {
          // Use type assertion for custom fields
          ...(character as any),
        },
      });
      return result;
    } catch (error) {
      this.logger.error({ error, character }, 'Error upserting character');
      throw error;
    }
  }

  async getActorsWithMovies(): Promise<any[]> {
    try {
      return await this.prismaService.client.actor.findMany({
        include: {
          characters: {
            include: {
              movie: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      this.logger.error({ error }, 'Error getting actors with movies');
      throw error;
    }
  }

  async getCharactersWithActorsAndMovies(): Promise<any[]> {
    try {
      return await this.prismaService.client.character.findMany({
        include: {
          movie: true,
          actor: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      this.logger.error({ error }, 'Error getting characters with actors and movies');
      throw error;
    }
  }

  async getActorByTmdbId(tmdbId: number): Promise<DbActor | null> {
    try {
      return await this.prismaService.client.actor.findUnique({
        where: { tmdbId },
      });
    } catch (error) {
      this.logger.error({ error, tmdbId }, 'Error getting actor by TMDB ID');
      throw error;
    }
  }

  async deleteAllCharacters(): Promise<void> {
    try {
      await this.prismaService.client.character.deleteMany({});
    } catch (error) {
      this.logger.error({ error }, 'Error deleting all characters');
      throw error;
    }
  }

  async deleteAllMovies(): Promise<void> {
    try {
      await this.prismaService.client.movie.deleteMany({});
    } catch (error) {
      this.logger.error({ error }, 'Error deleting all movies');
      throw error;
    }
  }

  async deleteAllActors(): Promise<void> {
    try {
      await this.prismaService.client.actor.deleteMany({});
    } catch (error) {
      this.logger.error({ error }, 'Error deleting all actors');
      throw error;
    }
  }
}
