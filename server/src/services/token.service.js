import jwt from 'jsonwebtoken';

export function createTokenService({ secret, expiresIn }) {
  return {
    sign: (user) => jwt.sign({ sub: user.id }, secret, { algorithm: 'HS256', expiresIn }),
    // Pin the algorithm so a forged "alg: none" / RS256 token is rejected.
    verify: (token) => jwt.verify(token, secret, { algorithms: ['HS256'] }),
  };
}
