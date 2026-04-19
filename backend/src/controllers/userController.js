const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log('Prisma client initialized');

const getUsers = async (req, res) => {
  console.log('getUsers called with query:', req.query);
  try {
    const { q } = req.query;
    const users = await prisma.user.findMany({
      where: q ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { firstName: { contains: q, mode: 'insensitive' } }
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
    const user = await prisma.user.findUnique({ where: { id } });
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
      { name: 'admin', firstName: 'Admin', rating: 5.0, contacts: { email: 'admin@example.com' } },
      { name: 'user1', firstName: 'John', rating: 4.2, contacts: { email: 'john@example.com' } },
      { name: 'user2', firstName: 'Jane', rating: 4.8, contacts: { email: 'jane@example.com' } }
    ];
    for (const u of initialUsers) {
      await prisma.user.create({ data: u });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  addUser,
  adjustRating,
  leaveFeedback,
  resetDatabase
};
