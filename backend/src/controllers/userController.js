import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

console.log('Prisma client initialized');

const getUsers = async (req, res) => {
  console.log('getUsers called with query:', req.query);
  try {
    const { q } = req.query;
    
    const accounts = await prisma.account.findMany({
      where: q ? {
        username: { 
          contains: q, 
          mode: 'insensitive' 
        }
      } : {},
      include: { 
        user: {
          select: {
            id: true,
            login: true,
            role: true,
            refer_id: true,
            is_active: true,
            created_at: true,
            updated_at: true
          }
        }
      }
    });
 
    const users = accounts.map(account => ({
      user: {
        id: account.user.id,
        login: account.user.login,
        role: account.user.role,
        refer_id: account.user.refer_id,
        is_active: account.user.is_active,
        created_at: account.user.created_at,
        updated_at: account.user.updated_at,
      },
      account: {
        id: account.id,
        username: account.username,
        avatar: account.avatar,
        bio: account.bio,
        reputation_score: account.reputation_score,
        deals_count: account.deals_count,
        positive_feedback_percent: account.positive_feedback_percent,
        verifications: account.verifications,
        created_at: account.created_at,
        updated_at: account.updated_at
      }
    }));

    console.log(`Found ${users.length} users`);
    res.json(users);
  } catch (error) {
    console.error('Error in getUsers:', error);
    res.status(500).json({ error: error.message });
  }
};


const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const userId = Number(id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid id format' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addUser = async (req, res) => {
  try {
    const { name, firstName, referral, deposit, contacts } = req.body;
    const user = await prisma.user.create({
      data: {
        name,
        firstName,
        rating: 0,
        referral: referral || null,
        deposit: deposit || 0,
        contacts: contacts || {}
      }
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const adjustRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { delta } = req.body;
    const user = await prisma.user.update({
      where: { id },
      data: { rating: { increment: delta } }
    });

    // Recalculate referral chain logic could go here
    if (user.referral) {
      const referrer = await prisma.user.findFirst({ where: { id: user.referral } });
      if (referrer) {
        await prisma.user.update({
          where: { id: referrer.id },
          data: { rating: { increment: delta * 0.1 } } // Example cascading effect
        });
      }
    }

    res.json({ success: true, newRating: user.rating });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateCurrentAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = Number(id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid id format' });
    }
    console.log('updateUser called with id:', userId, 'and body:', req.body);
    const account = await prisma.account.update({
      where: { id: userId },
      data: {
        username: req.body.username,
        avatar: req.body.avatar,
        bio: req.body.bio,
        reputation_score: req.body.reputation_score,
        deals_count: req.body.deals_count,
        positive_feedback_percent: req.body.positive_feedback_percent,
        verifications: req.body.verifications, // JSON поле
      }
    });
    res.json({ success: true, updatedAccount: account });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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

const resetDatabase = async (req, res) => {
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

    // Seed initial data
    const initialUsers = [
      { login: 'admin', password: 'admin123', username: 'Admin', rating: 5.0, role: 'ADMIN', is_active: true },
      { login: 'user1', password: 'pass123', username: 'John', rating: 4.2, role: 'USER', is_active: true },
      { login: 'user2', password: 'pass123', username: 'Jane', rating: 4.8, role: 'USER', is_active: false }
    ];

    for (const u of initialUsers) {
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
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  getUsers,
  getUserById,
  addUser,
  updateCurrentAccount,
  resetDatabase
};
