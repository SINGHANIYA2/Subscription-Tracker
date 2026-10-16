import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createAuthRouter } from './routes/auth.routes.js';
import { createAuthService } from './services/auth.service.js';
import { createTokenService } from './services/token.service.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

/**
 * App factory. Dependencies (user repository, Google verifier) are injected so the whole
 * HTTP layer can be tested without a database or network access.
 */
export function createApp({ env, users, verifyGoogleCredential }) {
  const app = express();
  if (env.TRUST_PROXY) app.set('trust proxy', env.TRUST_PROXY);

  const tokens = createTokenService({ secret: env.JWT_SECRET, expiresIn: env.JWT_EXPIRES_IN });
  const auth = createAuthService({ users, tokens, verifyGoogleCredential });

  const origins = env.CLIENT_URL.split(',').map((s) => s.trim().replace(/\/$/, ''));
  app.use(helmet());
  app.use(cors({ origin: origins, methods: ['GET', 'POST', 'PUT', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'] }));
  app.use(express.json({ limit: '10kb' }));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/auth', createAuthRouter({ auth, tokens }));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
