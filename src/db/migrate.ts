import { sequelize } from './index';
import '../models/Agent';
import '../models/Task';
import '../models/TaskLog';
import '../models/SyncQueue';
import '../models/Otp';

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');
    await sequelize.sync({ alter: true });
    console.log('All models were synchronized successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate(); 