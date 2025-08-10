import { PrismaClient } from '@prisma/client';
import { Logger } from 'pino';

export class PrismaService {
  private prisma: PrismaClient;
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
    this.prisma = new PrismaClient({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
    });

    // Log queries in development
    // if (process.env.NODE_ENV === 'development') {
    //   this.prisma.$on('query' as any, (e: any) => {
    //     this.logger.debug({ query: e.query, duration: e.duration }, 'Prisma query');
    //   });
    // }

    // this.prisma.$on('error' as any, (e: any) => {
    //   this.logger.error({ error: e }, 'Prisma error');
    // });
  }

  get client(): PrismaClient {
    return this.prisma;
  }

  async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      this.logger.info('Prisma client connected to database');
    } catch (error) {
      this.logger.error({ error }, 'Failed to connect to database');
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      this.logger.info('Prisma client disconnected from database');
    } catch (error) {
      this.logger.error({ error }, 'Failed to disconnect from database');
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error({ error }, 'Database health check failed');
      return false;
    }
  }
}
