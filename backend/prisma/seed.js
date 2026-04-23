import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

console.log('Starting database seeding...');

async function tableExists(tableName) {
  try {
    // Проверяем существование таблицы через системную таблицу PostgreSQL
    const result = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = '${tableName.toLowerCase()}'
      );
    `);
    return result[0].exists;
  } catch (e) {
    console.log(`Error checking table ${tableName}:`, e);
    return false;
  }
}

async function main() {
  try {
    // Проверяем существование таблиц
    const userTableExists = await tableExists('User');
    const accountTableExists = await tableExists('Account');

    console.log('User table exists:', userTableExists);
    console.log('Account table exists:', accountTableExists);

    // Очищаем таблицы в правильном порядке (с учетом внешних ключей)
    if (accountTableExists) {
      console.log('Clearing accounts table...');
      await prisma.account.deleteMany({});
      console.log('✓ Cleared accounts table');
    }

    if (userTableExists) {
      console.log('Clearing users table...');
      await prisma.user.deleteMany({});
      console.log('✓ Cleared users table');
    }

    // Создаем новых пользователей согласно схеме
    const users = [
      { login: 'admin', password: 'admin123', username: 'Admin', role: 'ADMIN', is_active: true },
      { login: 'user1', password: 'pass123', username: 'User1', role: 'USER', is_active: true },
      { login: 'user2', password: 'pass123', username: 'User2', role: 'USER', is_active: false }
    ];

    for (const u of users) {
      const password_hash = await bcrypt.hash(u.password, 10);

      // Создаем пользователя с полем login (согласно схеме)
      const user = await prisma.user.create({
        data: {
          login: u.login,
          password_hash,
          role: u.role,
          is_active: u.is_active
        }
      });

      // Создаем связанный аккаунт (id совпадает с user.id)
      await prisma.account.create({
        data: {
          id: user.id,
          username: u.username,
          verifications: {}
        }
      });

      console.log(`✓ Created user: ${u.login} with account: ${u.username}`);
    }

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });