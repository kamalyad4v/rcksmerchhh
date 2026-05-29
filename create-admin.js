const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  const email = 'admin@rcks.com';
  const password = 'Admin@123';
  const name = 'Admin';

  try {
    // Check if already exists
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      // Update role to ADMIN and reset password
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN', password: hashedPassword }
      });
      console.log('✅ Existing user updated to ADMIN!');
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'ADMIN'
        }
      });
      console.log('✅ Admin user created!');
    }

    console.log('');
    console.log('=============================');
    console.log('  ADMIN LOGIN CREDENTIALS');
    console.log('=============================');
    console.log('  Email   : admin@rcks.com');
    console.log('  Password: Admin@123');
    console.log('  URL     : http://localhost:3000/login');
    console.log('=============================');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
