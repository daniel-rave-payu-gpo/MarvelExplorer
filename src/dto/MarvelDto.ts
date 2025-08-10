export interface MoviesPerActorResponse {
  [actorName: string]: string[];
}

export interface ActorWithMultipleCharactersResponse {
  [actorName: string]: Array<{
    movieName: string;
    characterName: string;
  }>;
}

export interface CharacterWithMultipleActorsResponse {
  [characterName: string]: Array<{
    movieName: string;
    actorName: string;
  }>;
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
