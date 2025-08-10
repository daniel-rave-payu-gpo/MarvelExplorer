import axios from 'axios';
import {
  MoviesPerActorResponse,
  ActorWithMultipleCharactersResponse,
  CharacterWithMultipleActorsResponse
} from '../types/marvel';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const marvelApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const marvelService = {
  async getMoviesPerActor(): Promise<MoviesPerActorResponse> {
    const response = await marvelApi.get('/v1/marvel/moviesPerActor');
    return response.data;
  },

  async getActorsWithMultipleCharacters(): Promise<ActorWithMultipleCharactersResponse> {
    const response = await marvelApi.get('/v1/marvel/actorsWithMultipleCharacters');
    return response.data;
  },

  async getCharactersWithMultipleActors(): Promise<CharacterWithMultipleActorsResponse> {
    const response = await marvelApi.get('/v1/marvel/charactersWithMultipleActors');
    return response.data;
  },
};
