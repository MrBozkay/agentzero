/**
 * Seed admin user (idempotent — updates role if user already exists).
 *
 * Usage:
 *   pnpm --filter backend seed:admin -- <email> <password> [name]
 *
 * Example:
 *   pnpm --filter backend seed:admin -- admin@agentzero.dev changeme123 "Admin User"
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function main() {
  const [email, password, name] = process.argv.slice(2);

  if (!email || !password) {
    console.error('Usage: ts-node prisma/seed-admin.ts <email> <password> [name]');
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: { role: 'ADMIN', passwordHash, name: name ?? undefined },
      create: {
        email,
        passwordHash,
        name: name ?? 'Admin',
        role: 'ADMIN',
      },
    });

    console.log(`✅ Admin user ready: ${user.email} (role=${user.role}, id=${user.id})`);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
