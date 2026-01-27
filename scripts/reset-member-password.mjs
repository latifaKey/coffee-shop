import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

async function resetMemberPassword() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'barizta'
  });

  console.log('Connected to database');

  // Reset password untuk member
  const newPassword = 'member123';
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  await connection.execute(
    'UPDATE user SET password = ?, updatedAt = NOW() WHERE email = ?',
    [hashedPassword, 'member@barizta.com']
  );
  
  console.log('✅ Password reset successful!');
  console.log('');
  console.log('Login dengan:');
  console.log('   Email: member@barizta.com');
  console.log('   Password: member123');

  await connection.end();
}

resetMemberPassword().catch(console.error);
