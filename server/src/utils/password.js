import bcrypt from 'bcryptjs';

const ROUNDS = 12;
// Pre-computed hash compared against when the user doesn't exist (or has no password), so that
// "unknown email" and "wrong password" take about the same time.
const DUMMY_HASH = bcrypt.hashSync('timing-equalisation-placeholder', ROUNDS);

export const hashPassword = (plain) => bcrypt.hash(plain, ROUNDS);

export async function verifyPassword(plain, hash) {
  const match = await bcrypt.compare(plain, hash ?? DUMMY_HASH);
  return match && Boolean(hash);
}
