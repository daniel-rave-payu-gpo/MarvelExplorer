import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MoviesPerActor from './components/MoviesPerActor';
import ActorsWithMultipleCharacters from './components/ActorsWithMultipleCharacters';
import CharactersWithMultipleActors from './components/CharactersWithMultipleActors';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-red-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <h1 className="text-3xl font-bold">Marvel Explorer</h1>
              </div>
              <nav className="hidden md:flex space-x-8">
                <Link
                  to="/"
                  className="text-white hover:text-red-200 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Movies Per Actor
                </Link>
                <Link
                  to="/actors-multiple-characters"
                  className="text-white hover:text-red-200 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Actors with Multiple Characters
                </Link>
                <Link
                  to="/characters-multiple-actors"
                  className="text-white hover:text-red-200 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Characters with Multiple Actors
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Mobile Navigation */}
        <div className="md:hidden bg-red-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="text-white hover:text-red-200 block px-3 py-2 rounded-md text-base font-medium"
            >
              Movies Per Actor
            </Link>
            <Link
              to="/actors-multiple-characters"
              className="text-white hover:text-red-200 block px-3 py-2 rounded-md text-base font-medium"
            >
              Actors with Multiple Characters
            </Link>
            <Link
              to="/characters-multiple-actors"
              className="text-white hover:text-red-200 block px-3 py-2 rounded-md text-base font-medium"
            >
              Characters with Multiple Actors
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <main className="py-8">
          <Routes>
            <Route path="/" element={<MoviesPerActor />} />
            <Route path="/actors-multiple-characters" element={<ActorsWithMultipleCharacters />} />
            <Route path="/characters-multiple-actors" element={<CharactersWithMultipleActors />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-gray-300">
                Marvel Movie Data Explorer - Powered by TMDB API
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Data provided by The Movie Database (TMDB)
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
