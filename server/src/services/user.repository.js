// Thin data-access layer over Prisma. Kept separate so services/controllers (and tests)
// don't depend on Prisma directly.
export function createUserRepository(prisma) {
  return {
    findById: (id) => prisma.user.findUnique({ where: { id } }),
    findByEmail: (email) => prisma.user.findUnique({ where: { email } }),
    findByGoogleId: (googleId) => prisma.user.findUnique({ where: { googleId } }),
    create: (data) => prisma.user.create({ data }),
    update: (id, data) => prisma.user.update({ where: { id }, data }),
  };
}

// Prisma unique-constraint violation
export const isUniqueViolation = (err) => err?.code === 'P2002';
