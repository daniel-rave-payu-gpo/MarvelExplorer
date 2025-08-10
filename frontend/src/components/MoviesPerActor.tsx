import React, { useState, useEffect } from 'react';
import { marvelService } from '../services/marvelApi';
import { MoviesPerActorResponse } from '../types/marvel';

const MoviesPerActor: React.FC = () => {
  const [data, setData] = useState<MoviesPerActorResponse>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedActor, setSelectedActor] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await marvelService.getMoviesPerActor();
        setData(result);
        setError(null);
      } catch (err) {
        setError('Failed to fetch movies per actor data');
        console.error('Error fetching movies per actor:', err);
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
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">Movies Per Actor</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Actor List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Select an Actor</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {actors.map((actor) => (
              <button
                key={actor}
                onClick={() => setSelectedActor(actor)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedActor === actor
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <div className="font-medium">{actor}</div>
                <div className="text-sm opacity-75">
                  {data[actor].length} movie{data[actor].length !== 1 ? 's' : ''}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Movie List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">
            {selectedActor ? `${selectedActor}'s Movies` : 'Select an actor to view movies'}
          </h3>
          {selectedActor && (
            <div className="space-y-3">
              {data[selectedActor].map((movie, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500"
                >
                  <div className="font-medium">{movie}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoviesPerActor;
