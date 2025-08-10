import React, { useState, useEffect } from 'react';
import { marvelService } from '../services/marvelApi';
import { CharacterWithMultipleActorsResponse } from '../types/marvel';

const CharactersWithMultipleActors: React.FC = () => {
  const [data, setData] = useState<CharacterWithMultipleActorsResponse>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await marvelService.getCharactersWithMultipleActors();
        setData(result);
        setError(null);
      } catch (err) {
        setError('Failed to fetch characters with multiple actors data');
        console.error('Error fetching characters with multiple actors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-600 text-xl">{error}</div>
      </div>
    );
  }

  const characters = Object.keys(data);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">Characters with Multiple Actors</h2>
      
      {characters.length === 0 ? (
        <div className="text-center text-gray-600 text-xl">
          No characters found with multiple actors.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {characters.map((character) => (
            <div key={character} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 text-purple-600">{character}</h3>
              <div className="space-y-3">
                {data[character].map((appearance, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border-l-4 border-purple-500">
                    <div className="font-medium text-gray-800">{appearance.actorName}</div>
                    <div className="text-sm text-gray-600">in {appearance.movieName}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Total actors: {data[character].length}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CharactersWithMultipleActors;
