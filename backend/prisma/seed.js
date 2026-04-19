const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany({});
  
  const users = [];
  for (let i = 1; i <= 20; i++) {
    users.push({
      name: `user${i}`,
      firstName: `First${i}`,
      rating: Math.floor(Math.random() * 50) / 10,
      deposit: Math.floor(Math.random() * 1000),
      contacts: { email: `user${i}@example.com`, telegram: `@user${i}` },
      referral: i > 5 ? `user${Math.floor(Math.random() * 5) + 1}` : null
    });
  }

  for (const user of users) {
    await prisma.user.create({ data: user });
  }
  
  console.log('Database seeded with 20 users');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
