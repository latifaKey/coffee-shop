import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetMemberPassword() {
  try {
    console.log('Connected to database');

    // Reset password untuk member
    const newPassword = 'member123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { email: 'member@barizta.com' },
      data: { 
        password: hashedPassword,
        updatedAt: new Date()
      }
    });
    
    console.log('✅ Password reset successful!');
    console.log('');
    console.log('Login dengan:');
    console.log('   Email: member@barizta.com');
    console.log('   Password: member123');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetMemberPassword().catch(console.error);
