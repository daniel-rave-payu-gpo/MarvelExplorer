import axios, { AxiosInstance } from 'axios';
import { Logger } from 'pino';
import {
  MoviesPerActorResponse,
  ActorWithMultipleCharactersResponse,
  CharacterWithMultipleActorsResponse,
} from '../../dto/MarvelDto';
import { MarvelRepository } from '../../repositories/MarvelRepository';
import { normalizeCharacterName, findCloseCanonicalKey } from '../../utils/nameMatching';

export class MarvelService {
  private tmdbClient: AxiosInstance;
  private logger: Logger;
  private marvelRepository: MarvelRepository;

  constructor(logger: Logger, marvelRepository: MarvelRepository) {
    this.logger = logger;
    this.marvelRepository = marvelRepository;
    this.tmdbClient = axios.create({
      baseURL: 'https://api.themoviedb.org/3',
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5MjdhMDcxMzk3OThjZGQ1NjA0ZTQyOTcwNzdjMzQzNSIsIm5iZiI6MTczMTMyOTMzOS44NDMyNDMxLCJzdWIiOiI2NzMxZmMwZjBkNzU4MDQwZWI0YjE2MmIiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.e-7ALW2PRpz76PqLzoKP-bsOBeMchAtLx7TW1QOH-so`,
        'Content-Type': 'application/json',
      },
    });
  }

  async getMoviesPerActor(): Promise<MoviesPerActorResponse> {
    const actorsWithMovies = await this.marvelRepository.getMoviesPerActor();

    const result: MoviesPerActorResponse = {};

    for (const actor of actorsWithMovies) {
      if (actor.characters && actor.characters.length > 0) {
        const movieTitles = actor.characters.map((char: any) => char.movie.title);
        result[actor.name] = movieTitles;
      }
    }

    return result;
  }

  async getActorsWithMultipleCharacters(): Promise<ActorWithMultipleCharactersResponse> {
    try {
      this.logger.info('Getting actors with multiple characters using name similarity logic');

      const result = await this.marvelRepository.getActorsWithMultipleCharacters();

      const response: ActorWithMultipleCharactersResponse = {};

      for (const actor of result.data) {
        if (actor.characters && actor.characters.length > 1) {
          // Group characters by canonical names to handle similar character names
          const characterGroups = this.groupCharactersByCanonicalName(actor.characters);

          // Only include actors who truly have multiple distinct characters after canonicalization
          if (characterGroups.size > 1) {
            const characterData = Array.from(characterGroups.entries()).map(([canonicalName, appearances]) => {
              // Use the first appearance as representative for this canonical character
              const representativeChar = appearances[0];
              return {
                movieName: representativeChar.movie.title,
                characterName: canonicalName,
              };
            });

            response[actor.name] = characterData;
          }
        }
      }
      return response;
    } catch (error) {
      this.logger.error({ error }, 'Error getting actors with multiple characters');
      throw error;
    }
  }

  async getCharactersWithMultipleActors(): Promise<CharacterWithMultipleActorsResponse> {
    try {
      this.logger.info('Getting characters with multiple actors using name similarity logic');

      const result = await this.marvelRepository.getCharactersWithActorsAndMovies();

      const charactersWithMultipleActors: CharacterWithMultipleActorsResponse = {};

      // Group by canonical (normalized + alias + fuzzy) character name
      const characterGroups = this.groupCharactersByCanonicalName(result);

      // Filter characters with multiple actors and deduplicate actor entries
      for (const [characterName, appearances] of characterGroups.entries()) {
        const dedupedAppearances = this.deduplicateActorAppearances(appearances);

        // Only include if more than one unique actor portrayed the character
        if (dedupedAppearances.length > 1) {
          charactersWithMultipleActors[characterName] = dedupedAppearances;
        }
      }

      return charactersWithMultipleActors;
    } catch (error) {
      this.logger.error({ error }, 'Error getting characters with multiple actors from database');
      throw error;
    }
  }

  /**
   * Groups characters by their canonical names using name similarity logic
   */
  private groupCharactersByCanonicalName(characters: any[]): Map<string, any[]> {
    const characterGroups: Map<string, any[]> = new Map();

    for (const char of characters) {
      const raw = String(char.name || '');
      const normalized = String((char as any).normalizedName || normalizeCharacterName(raw));
      const existingKey = findCloseCanonicalKey(normalized, characterGroups.keys());
      const canonical = existingKey || normalized;

      if (!characterGroups.has(canonical)) {
        characterGroups.set(canonical, []);
      }
      characterGroups.get(canonical)!.push(char);
    }

    return characterGroups;
  }

  /**
   * Deduplicates actor appearances for a character, keeping one movie per actor
   */
  private deduplicateActorAppearances(appearances: any[]): Array<{ actorName: string; movieName: string }> {
    // Build map: actor name -> set of movies (to avoid duplicates per actor)
    const moviesByActor = new Map<string, Set<string>>();

    for (const char of appearances as any[]) {
      const actorName = String(char.actor.name);
      const movieTitle = String(char.movie.title);

      if (!moviesByActor.has(actorName)) {
        moviesByActor.set(actorName, new Set<string>());
      }
      moviesByActor.get(actorName)!.add(movieTitle);
    }

    // Collapse to one entry per actor (keep a representative movie for display)
    return [...moviesByActor.entries()]
      .map(([actorName, movieSet]) => ({
        actorName,
        movieName: [...movieSet][0],
      }))
      .sort((a, b) => a.actorName.localeCompare(b.actorName));
  }
}
