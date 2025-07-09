import { Sequelize, DataTypes } from 'sequelize';

export const sequelize = new Sequelize(process.env.DATABASE_URL as string, {
  dialect: 'postgres',
  logging: false,
});

export { DataTypes }; 