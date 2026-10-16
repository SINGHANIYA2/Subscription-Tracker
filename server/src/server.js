import { PrismaClient } from '@prisma/client';
import { loadEnv } from './config/env.js';
import { createApp } from './app.js';
import { createUserRepository } from './services/user.repository.js';
import { createGoogleVerifier } from './services/google.service.js';

const env = loadEnv();
const prisma = new PrismaClient();

const app = createApp({
  env,
  users: createUserRepository(prisma),
  verifyGoogleCredential: createGoogleVerifier(env.GOOGLE_CLIENT_ID),
});

const server = app.listen(env.PORT, () => console.log(`API listening on http://localhost:${env.PORT}`));

const shutdown = async () => {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
