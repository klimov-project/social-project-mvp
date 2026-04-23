import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

console.log('Starting database seeding...');

async function main() {
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});

  const users = [
    { login: 'admin', password: 'admin123', username: 'Admin', role: 'ADMIN', is_active: true },
    { login: 'user1', password: 'pass123', username: 'User1', role: 'USER', is_active: true },
    { login: 'user2', password: 'pass123', username: 'User2', role: 'USER', is_active: false }
  ];

  for (const u of users) {
    const password_hash = await bcrypt.hash(u.password, 10);
    const user = await prisma.user.create({
      data: {
        login: u.login,
        password_hash,
        role: u.role,
        is_active: u.is_active
      }
    });

    await prisma.account.create({
      data: {
        id: user.id,
        username: u.username,
        verifications: {}
      }
    });
  }

  console.log('Database seeded with users');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
