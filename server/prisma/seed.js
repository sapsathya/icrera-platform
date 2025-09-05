
const prisma = require('./lib/prisma');
const bcrypt = require('bcryptjs');

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@example.com',
      password_hash: await bcrypt.hash('adminpass', 10),
      role: 'admin',
      is_active: true
    }
  });
  console.log('Seeded admin:', admin.email);

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      name: 'Test User',
      email: 'user@example.com',
      password_hash: await bcrypt.hash('userpass', 10),
      role: 'user',
      is_active: true
    }
  });
  console.log('Seeded user:', user.email);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
