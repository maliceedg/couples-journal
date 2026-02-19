/**
 * Prisma config (replaces package.json "prisma" key).
 * See https://pris.ly/prisma-config
 */
export default {
  schema: 'prisma/schema.prisma',
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
};
