import connectDB from '../config/db.js';
import Admin from '../models/Admin.js';
import dotenv from 'dotenv';
import logger from '../config/logger.js';

dotenv.config();

async function seedAdmins() {
  try {
    await connectDB();

    // Delete existing admins
    await Admin.deleteMany();

    // Create new admins
    const admins = await Admin.create([
      {
        name: 'Mahmood Kaliika',
        email: 'mahmoodkaliika810@gmail.com',
        password: 'KM!IG@mers810',
        role: 'superadmin',
      },
      {
        name: 'Mahmood Kaliika',
        email: 'moodkerlix@gmail.com',
        password: 'KM!IG@mers810',
        role: 'admin',
      },
    ]);

    logger.info('Seeded admins:');
    admins.forEach((admin) =>
      logger.info(`- ${admin.name} (${admin.email}) [${admin.role}]`)
    );

    process.exit(0);
  } catch (error) {
    logger.error('Error seeding admins:', error);
    process.exit(1);
  }
}

seedAdmins();
