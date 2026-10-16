export const createAuthController = (auth) => ({
  register: async (req, res) => res.status(201).json(await auth.register(req.body)),
  login: async (req, res) => res.json(await auth.login(req.body)),
  google: async (req, res) => res.json(await auth.loginWithGoogle(req.body.credential)),
  me: (req, res) => res.json({ user: req.user }),
  // JWTs are stateless: the client discards its token. The endpoint exists so the client has one
  // place to call, and server-side revocation can be added later without API changes.
  logout: (_req, res) => res.status(204).end(),
});
