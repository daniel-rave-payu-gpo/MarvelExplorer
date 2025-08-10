import { Pool, PoolClient } from 'pg';
import { Logger } from 'pino';

export class PostgresClient {
  private pool: Pool;
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
    this.pool = new Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: process.env.POSTGRES_DB || 'marvel_explorer',
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'password',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.pool.on('error', err => {
      this.logger.error({ err }, 'Unexpected error on idle client');
    });
  }

  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  async query(text: string, params?: any[]): Promise<any> {
    const client = await this.getClient();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  async initTables(): Promise<void> {
    const createMoviesTable = `
      CREATE TABLE IF NOT EXISTS movies (
        id SERIAL PRIMARY KEY,
        tmdb_id INTEGER UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        release_date DATE,
        overview TEXT,
        poster_path VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createActorsTable = `
      CREATE TABLE IF NOT EXISTS actors (
        id SERIAL PRIMARY KEY,
        tmdb_id INTEGER UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        profile_path VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createCharactersTable = `
      CREATE TABLE IF NOT EXISTS characters (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        movie_id INTEGER REFERENCES movies(id),
        actor_id INTEGER REFERENCES actors(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(movie_id, actor_id, name)
      );
    `;

    try {
      await this.query(createMoviesTable);
      await this.query(createActorsTable);
      await this.query(createCharactersTable);
      this.logger.info('Database tables initialized successfully');
    } catch (error) {
      this.logger.error({ error }, 'Error initializing database tables');
      throw error;
    }
  }
}
