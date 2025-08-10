export interface TMDBMovieData {
  id: number;
  title: string;
  tmdbId: number;
}

export interface TMDBActorData {
  id: number;
  name: string;
  tmdbId: number;
}

export interface TMDBExtractionData {
  movies: { [title: string]: number };
  actors: string[];
}

export interface TMDBMovieResponse {
  id: number;
  title: string;
  release_date: string;
  overview: string;
  poster_path?: string;
  credits?: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path?: string;
    }>;
  };
}

export interface TMDBMovieCreditsResponse {
  id: number;
  cast: Array<{
    id: number;
    name: string;
    character: string;
    profile_path?: string;
  }>;
}

export interface TMDBExtractionResult {
  movies: TMDBMovieData[];
  actors: TMDBActorData[];
  characters: Array<{
    name: string;
    movieId: number;
    actorId: number;
  }>;
}
