export interface Movie {
  id: number;
  title: string;
  release_date: string;
  overview: string;
  poster_path?: string;
}

export interface Actor {
  id: number;
  name: string;
  profile_path?: string;
}

export interface Character {
  id: number;
  name: string;
  movie_id: number;
  actor_id: number;
}

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
