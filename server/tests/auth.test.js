import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app.js';
import { loadEnv } from '../src/config/env.js';
import { AppError } from '../src/utils/AppError.js';

const env = loadEnv({
  DATABASE_URL: 'postgresql://x', JWT_SECRET: 'x'.repeat(40), GOOGLE_CLIENT_ID: 'test-client',
  CLIENT_URL: 'http://localhost:5173',
});

// ---- in-memory stand-in for the Prisma-backed repository -------------------------------
function memoryUsers() {
  const rows = [];
  const uniq = (d, skip) =>
    rows.some((r) => r.id !== skip && ((d.email && r.email === d.email) || (d.googleId && r.googleId === d.googleId)));
  const dup = () => Object.assign(new Error('unique'), { code: 'P2002' });
  return {
    rows,
    findById: async (id) => rows.find((r) => r.id === id) ?? null,
    findByEmail: async (e) => rows.find((r) => r.email === e) ?? null,
    findByGoogleId: async (g) => rows.find((r) => r.googleId === g) ?? null,
    create: async (d) => {
      if (uniq(d)) throw dup();
      const row = { id: `u${rows.length + 1}`, passwordHash: null, googleId: null, avatarUrl: null, createdAt: new Date(), ...d };
      rows.push(row); return { ...row };
    },
    update: async (id, d) => {
      if (uniq(d, id)) throw dup();
      const row = rows.find((r) => r.id === id); Object.assign(row, d); return { ...row };
    },
  };
}

// Fake Google: credential string "good:<sub>:<email>" is valid, anything else is rejected.
const fakeGoogle = async (cred) => {
  const [tag, sub, email] = cred.split(':');
  if (tag !== 'good') throw new AppError(401, 'INVALID_GOOGLE_TOKEN', 'bad');
  return { googleId: sub, email, name: 'Gina Google', avatarUrl: 'http://pic' };
};

let server, base, users;
before(async () => {
  users = memoryUsers();
  const app = createApp({ env, users, verifyGoogleCredential: fakeGoogle });
  await new Promise((r) => { server = app.listen(0, r); });
  base = `http://127.0.0.1:${server.address().port}/api`;
});
after(() => server.close());

const call = async (path, { method = 'GET', body, token } = {}) => {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body && JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
};
const GOOD = { name: 'Asha Rao', email: 'Asha@Example.com ', password: 'supersecret1' };

test('register creates account, normalises email, never leaks hash', async () => {
  const r = await call('/auth/register', { method: 'POST', body: GOOD });
  assert.equal(r.status, 201);
  assert.equal(r.body.user.email, 'asha@example.com');
  assert.ok(r.body.token);
  assert.equal(r.body.user.passwordHash, undefined);
  assert.notEqual(users.rows[0].passwordHash, GOOD.password);
  assert.match(users.rows[0].passwordHash, /^\$2[aby]\$12\$/);
});

test('register rejects duplicate email (case-insensitive)', async () => {
  const r = await call('/auth/register', { method: 'POST', body: { ...GOOD, email: 'ASHA@example.com' } });
  assert.equal(r.status, 409);
  assert.equal(r.body.error.code, 'EMAIL_TAKEN');
});

test('register validates input with per-field errors', async () => {
  const r = await call('/auth/register', { method: 'POST', body: { name: 'A', email: 'nope', password: 'short' } });
  assert.equal(r.status, 400);
  assert.deepEqual(Object.keys(r.body.error.fields).sort(), ['email', 'name', 'password']);
});

test('login succeeds with correct password and /me returns the user', async () => {
  const r = await call('/auth/login', { method: 'POST', body: { email: 'ASHA@example.com', password: GOOD.password } });
  assert.equal(r.status, 200);
  const me = await call('/auth/me', { token: r.body.token });
  assert.equal(me.status, 200);
  assert.equal(me.body.user.email, 'asha@example.com');
  assert.equal(me.body.user.hasPassword, true);
});

test('login fails safely: wrong password and unknown email give the same answer', async () => {
  const a = await call('/auth/login', { method: 'POST', body: { email: 'asha@example.com', password: 'wrongwrong' } });
  const b = await call('/auth/login', { method: 'POST', body: { email: 'ghost@example.com', password: 'wrongwrong' } });
  assert.equal(a.status, 401); assert.equal(b.status, 401);
  assert.deepEqual(a.body, b.body);
});

test('/me rejects missing, garbage, expired and wrongly-signed tokens', async () => {
  assert.equal((await call('/auth/me')).status, 401);
  assert.equal((await call('/auth/me', { token: 'garbage' })).status, 401);
  const expired = jwt.sign({ sub: 'u1' }, env.JWT_SECRET, { expiresIn: -10 });
  assert.equal((await call('/auth/me', { token: expired })).status, 401);
  const forged = jwt.sign({ sub: 'u1' }, 'y'.repeat(40));
  assert.equal((await call('/auth/me', { token: forged })).status, 401);
  const none = jwt.sign({ sub: 'u1' }, '', { algorithm: 'none' });
  assert.equal((await call('/auth/me', { token: none })).status, 401);
});

test('token for a deleted user is rejected', async () => {
  const t = jwt.sign({ sub: 'does-not-exist' }, env.JWT_SECRET);
  assert.equal((await call('/auth/me', { token: t })).status, 401);
});

test('google: new user is created and can use /me', async () => {
  const r = await call('/auth/google', { method: 'POST', body: { credential: 'good:g-100:gina@gmail.com' } });
  assert.equal(r.status, 200);
  assert.equal(r.body.user.email, 'gina@gmail.com');
  assert.equal(r.body.user.hasGoogle, true);
  assert.equal(r.body.user.hasPassword, false);
  assert.equal((await call('/auth/me', { token: r.body.token })).status, 200);
});

test('google: repeat login returns same user (no duplicate)', async () => {
  const before = users.rows.length;
  const r = await call('/auth/google', { method: 'POST', body: { credential: 'good:g-100:gina@gmail.com' } });
  assert.equal(r.status, 200);
  assert.equal(users.rows.length, before);
});

test('google: links to existing password account with same email', async () => {
  const r = await call('/auth/google', { method: 'POST', body: { credential: 'good:g-200:asha@example.com' } });
  assert.equal(r.status, 200);
  assert.equal(r.body.user.hasGoogle, true);
  assert.equal(r.body.user.hasPassword, true);
  assert.equal(r.body.user.name, 'Asha Rao'); // existing profile kept
  // password login still works after linking
  const l = await call('/auth/login', { method: 'POST', body: { email: 'asha@example.com', password: GOOD.password } });
  assert.equal(l.status, 200);
});

test('google: invalid credential is rejected', async () => {
  const r = await call('/auth/google', { method: 'POST', body: { credential: 'bad:token:value:padding-padding' } });
  assert.equal(r.status, 401);
  assert.equal(r.body.error.code, 'INVALID_GOOGLE_TOKEN');
  assert.equal((await call('/auth/google', { method: 'POST', body: {} })).status, 400);
});

test('password login on Google-only account says to use Google', async () => {
  const r = await call('/auth/login', { method: 'POST', body: { email: 'gina@gmail.com', password: 'anything123' } });
  assert.equal(r.status, 401);
  assert.equal(r.body.error.code, 'USE_GOOGLE');
});

test('logout, health, 404 and bad JSON behave', async () => {
  assert.equal((await call('/auth/logout', { method: 'POST' })).status, 204);
  assert.equal((await call('/health')).body.status, 'ok');
  assert.equal((await call('/nope')).status, 404);
  const bad = await fetch(base + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{oops' });
  assert.equal(bad.status, 400);
});

test('rate limiter blocks brute force', async () => {
  const app = createApp({ env, users: memoryUsers(), verifyGoogleCredential: fakeGoogle });
  const s = await new Promise((r) => { const x = app.listen(0, () => r(x)); });
  const url = `http://127.0.0.1:${s.address().port}/api/auth/login`;
  let last;
  for (let i = 0; i < 31; i++) {
    last = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'a@b.co', password: 'x' }) });
  }
  assert.equal(last.status, 429);
  s.close();
});

test('env validation rejects a short JWT secret', () => {
  assert.throws(() => loadEnv({ DATABASE_URL: 'x', JWT_SECRET: 'short', GOOGLE_CLIENT_ID: 'c' }), /JWT_SECRET/);
});
