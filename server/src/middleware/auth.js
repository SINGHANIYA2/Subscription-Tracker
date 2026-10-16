import { AppError } from '../utils/AppError.js';

export const requireAuth = ({ tokens, auth }) => async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new AppError(401, 'UNAUTHENTICATED', 'Please log in to continue.');
  }
  let payload;
  try {
    payload = tokens.verify(token);
  } catch {
    throw new AppError(401, 'INVALID_TOKEN', 'Your session has expired. Please log in again.');
  }
  const user = await auth.getUser(payload.sub);
  if (!user) throw new AppError(401, 'INVALID_TOKEN', 'Your session is no longer valid. Please log in again.');
  req.user = user;
  next();
};
