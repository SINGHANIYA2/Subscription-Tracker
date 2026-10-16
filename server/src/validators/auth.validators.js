import { z } from 'zod';

const email = z.string().trim().toLowerCase().max(254).pipe(z.email('Enter a valid email address.'));

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(80),
  email,
  // bcrypt only uses the first 72 bytes, so cap there instead of silently truncating
  password: z.string().min(8, 'Password must be at least 8 characters.').max(72, 'Password is too long (max 72).'),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required.').max(72),
});

export const googleSchema = z.object({
  credential: z.string().min(20, 'Missing Google credential.').max(4096),
});
