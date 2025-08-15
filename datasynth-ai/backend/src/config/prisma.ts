import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'error' },
    { emit: 'stdout', level: 'warn' }
  ]
});

// Optional: log queries in dev
if (process.env.NODE_ENV !== 'production') {
  prisma.$on('query', (e) => {
    // eslint-disable-next-line no-console
    console.log(`\n[Prisma] ${e.query} — params: ${e.params} (duration: ${e.duration}ms)`);
  });
}