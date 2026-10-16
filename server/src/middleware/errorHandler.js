import { AppError } from '../utils/AppError.js';

export const notFound = (_req, _res, next) => next(new AppError(404, 'NOT_FOUND', 'Route not found.'));

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message, fields: err.details } });
  }
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { code: 'BAD_JSON', message: 'Request body is not valid JSON.' } });
  }
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ error: { code: 'TOO_LARGE', message: 'Request body too large.' } });
  }
  console.error('Unhandled error:', err?.stack || err);
  res.status(500).json({ error: { code: 'INTERNAL', message: 'Something went wrong. Please try again.' } });
};
