import React, { useState, useEffect } from 'react';
import { marvelService } from '../services/marvelApi';
import { ActorWithMultipleCharactersResponse } from '../types/marvel';

const ActorsWithMultipleCharacters: React.FC = () => {
  const [data, setData] = useState<ActorWithMultipleCharactersResponse>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await marvelService.getActorsWithMultipleCharacters();
        setData(result);
        setError(null);
      } catch (err) {
        setError('Failed to fetch actors with multiple characters data');
        console.error('Error fetching actors with multiple characters:', err);
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

  const actors = Object.keys(data);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">Actors with Multiple Characters</h2>
      
      {actors.length === 0 ? (
        <div className="text-center text-gray-600 text-xl">
          No actors found with multiple characters.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {actors.map((actor) => (
            <div key={actor} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 text-blue-600">{actor}</h3>
              <div className="space-y-3">
                {data[actor].map((role, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border-l-4 border-green-500">
                    <div className="font-medium text-gray-800">{role.characterName}</div>
                    <div className="text-sm text-gray-600">in {role.movieName}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Total characters: {data[actor].length}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActorsWithMultipleCharacters;
