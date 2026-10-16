import { AppError } from '../utils/AppError.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { isUniqueViolation } from './user.repository.js';

// Never send passwordHash / googleId to the client.
export const toPublicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  avatarUrl: u.avatarUrl ?? null,
  hasPassword: Boolean(u.passwordHash),
  hasGoogle: Boolean(u.googleId),
  createdAt: u.createdAt,
});

const emailTaken = () =>
  new AppError(409, 'EMAIL_TAKEN', 'An account with this email already exists. Try logging in.');

export function createAuthService({ users, tokens, verifyGoogleCredential }) {
  const session = async (user) => {
    const updated = await users.update(user.id, { lastLoginAt: new Date() });
    return { token: tokens.sign(updated), user: toPublicUser(updated) };
  };

  return {
    async register({ name, email, password }) {
      if (await users.findByEmail(email)) throw emailTaken();
      let user;
      try {
        user = await users.create({ name, email, passwordHash: await hashPassword(password) });
      } catch (err) {
        if (isUniqueViolation(err)) throw emailTaken();
        throw err;
      }
      return session(user);
    },

    async login({ email, password }) {
      const user = await users.findByEmail(email);
      const ok = await verifyPassword(password, user?.passwordHash);
      if (!user || !ok) {
        // Google-only account: point the user to the right button.
        if (user && !user.passwordHash) {
          throw new AppError(401, 'USE_GOOGLE', 'This account uses Google sign-in. Please continue with Google.');
        }
        throw new AppError(401, 'INVALID_CREDENTIALS', 'Incorrect email or password.');
      }
      return session(user);
    },

    async loginWithGoogle(credential) {
      const profile = await verifyGoogleCredential(credential);

      let user = await users.findByGoogleId(profile.googleId);
      if (!user) {
        // Same email already registered with a password -> link the Google account to it.
        // Safe because Google asserted the email is verified (checked in the verifier).
        const existing = await users.findByEmail(profile.email);
        if (existing) {
          user = await users.update(existing.id, {
            googleId: profile.googleId,
            avatarUrl: existing.avatarUrl ?? profile.avatarUrl,
          });
        } else {
          try {
            user = await users.create(profile);
          } catch (err) {
            // Two simultaneous first-time logins: the other request won, so use its row.
            if (!isUniqueViolation(err)) throw err;
            user = (await users.findByGoogleId(profile.googleId)) ?? (await users.findByEmail(profile.email));
            if (!user) throw err;
          }
        }
      }
      return session(user);
    },

    async getUser(id) {
      const user = await users.findById(id);
      return user ? toPublicUser(user) : null;
    },
  };
}
