import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { registerSchema, loginSchema, googleSchema } from '../validators/auth.validators.js';
import { createAuthController } from '../controllers/auth.controller.js';

export function createAuthRouter({ auth, tokens }) {
  const router = Router();
  const c = createAuthController(auth);

  // Brute-force protection on the credential endpoints.
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (_req, res) =>
      res.status(429).json({ error: { code: 'RATE_LIMITED', message: 'Too many attempts. Please wait a few minutes.' } }),
  });

  router.post('/register', limiter, validate(registerSchema), c.register);
  router.post('/login', limiter, validate(loginSchema), c.login);
  router.post('/google', limiter, validate(googleSchema), c.google);
  router.post('/logout', c.logout);
  router.get('/me', requireAuth({ tokens, auth }), c.me);
  return router;
}
