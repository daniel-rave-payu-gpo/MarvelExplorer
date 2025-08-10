# Marvel Explorer

A service that explores Marvel movie data, actors, and characters using TMDB data with intelligent character name matching.

## How It Works

### Service Architecture
The Marvel Explorer service consists of:
- **Backend API** (Node.js + Fastify) that processes Marvel movie data
- **Frontend Client** that visualizes the data relationships
- **PostgreSQL Database** with Prisma ORM for data storage
- **TMDB Integration** for fetching movie and actor data

### Data Import & Filtering
The service uses a **selective data importer** that:
- Filters TMDB data by **specific movies** (configured in `src/config/tmdbExtractionData.ts`)
- Filters by **specific actors** to focus on Marvel universe performers
- **Clears existing data** before importing fresh data (destructive import)
- Processes movie credits to extract character-actor relationships

### Character Name Similarity Logic
The service is smart about character names. Sometimes the same character name is written slightly differently in different movies - like "Spider-Man" in one movie and "Spider Man" (without the hyphen) in another, or "Black Widow" vs "BlackWidow" (no space). The service figures out these are the same character and groups them together, so you can see all the movies where that character appears, even if their name has small formatting differences.

### Frontend Client Features
The React-based client provides:
- **Movies Per Actor** visualization showing which movies each actor appeared in
- **Actors with Multiple Characters** display highlighting versatile performers
- **Characters with Multiple Actors** view showing character recasting across films
- **Interactive data exploration** with clean, modern UI

### Data Flow
1. **Import**: TMDB data is filtered and imported via `/v1/tmdb-extraction/import`
2. **Processing**: Character names are normalized and grouped using similarity algorithms
3. **Storage**: Relationships are stored in PostgreSQL with proper indexing
4. **API**: Core endpoints provide filtered, processed data
5. **Client**: Frontend renders the relationships in an intuitive interface

### Endpoints
- GET `/v1/marvel/moviesPerActor`
- GET `/v1/marvel/actorsWithMultipleCharacters`
- GET `/v1/marvel/charactersWithMultipleActors`
- GET `/v1/marvel/actors`
- GET `/v1/marvel/movies`
- GET `/v1/marvel/characters`
- GET `/v1/tmdb-extraction/stats`
- POST `/v1/tmdb-extraction/import` (destructive: clears then imports)

### Quick start
1) Install deps
```bash
npm install
cd frontend && npm install
```
2) Start DB and migrate
```bash
docker-compose -f docker-compose.marvel.yaml up -d
npm run loadenv
npx prisma migrate dev
```
3) Run backend and frontend
```bash
npm run build && npm start
cd frontend && npm start
```

### Populate data
```bash
curl -X POST http://localhost:3000/v1/tmdb-extraction/import
```

### Config
Create `env.yaml` with:
```yaml
DATABASE_URL: "postgresql://username:password@localhost:5432/marvel_explorer"
  TMDB_ACCESS_TOKEN: "<token>"  # required
PORT: 3000
NODE_ENV: development
LOG_LEVEL: info
```

