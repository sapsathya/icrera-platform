const prisma = require('../src/lib/prisma');
const bcrypt = require('bcryptjs');

async function ensureDefaultAdmin(){
  try {
    const admin = await prisma.user.findFirst({ where: { role: 'admin' }});
    if (!admin) {
      const hash = await bcrypt.hash('adminpass', 10);
      const user = await prisma.user.create({
        data: {
          name: 'Admin',
          email: 'admin@example.com',
          password_hash: hash,
          role: 'admin',
          is_active: true
        }
      });
      console.log('Created default admin: admin@example.com / adminpass');
    } else {
      console.log('Admin user exists:', admin.email);
    }
  } catch (e) {
    console.error('Error ensuring default admin:', e);
  }
}

module.exports = { ensureDefaultAdmin };