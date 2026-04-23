import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

console.log('Prisma client initialized');

const getUsers = async (req, res) => {
  console.log('getUsers called with query:', req.query);
  try {
    const { q } = req.query;
    const users = await prisma.account.findMany({
      where: q ? {
        OR: [
          { username: { contains: q, mode: 'insensitive' } }
        ],
      } : {},
    });
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

const leaveFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body; // rating from feedback
    const user = await prisma.user.update({
      where: { id },
      data: { rating: { increment: rating } }
    });
    res.json({ success: true, updatedRating: user.rating });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const resetDatabase = async (req, res) => {
  try {
    await prisma.user.deleteMany({});
    // Seed initial data
    const initialUsers = [
      { login: 'admin', password: 'admin123', username: 'Admin', rating: 5.0, role: 'ADMIN', is_active: true },
      { login: 'user1', password: 'pass123', username: 'John', rating: 4.2, role: 'USER', is_active: true },
      { login: 'user2', password: 'pass123', username: 'Jane', rating: 4.8, role: 'USER', is_active: false }
    ];
    for (const u of initialUsers) {
      await prisma.user.create({ data: u });
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
  adjustRating,
  leaveFeedback,
  resetDatabase
};
