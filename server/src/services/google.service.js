import { OAuth2Client } from 'google-auth-library';
import { AppError } from '../utils/AppError.js';

/**
 * Verifies a Google Sign-In ID token (the "credential" produced by Google Identity Services)
 * and returns the verified profile. Signature, expiry, issuer and audience are all checked
 * by google-auth-library.
 */
export function createGoogleVerifier(clientId) {
  const client = new OAuth2Client(clientId);
  return async function verifyGoogleCredential(credential) {
    let payload;
    try {
      const ticket = await client.verifyIdToken({ idToken: credential, audience: clientId });
      payload = ticket.getPayload();
    } catch {
      throw new AppError(401, 'INVALID_GOOGLE_TOKEN', 'Google sign-in could not be verified. Please try again.');
    }
    if (!payload?.sub || !payload.email) {
      throw new AppError(401, 'INVALID_GOOGLE_TOKEN', 'Google account did not provide an email address.');
    }
    if (!payload.email_verified) {
      throw new AppError(401, 'GOOGLE_EMAIL_UNVERIFIED', 'Your Google email address is not verified.');
    }
    return {
      googleId: payload.sub,
      email: payload.email.toLowerCase(),
      name: payload.name || payload.email.split('@')[0],
      avatarUrl: payload.picture || null,
    };
  };
}
