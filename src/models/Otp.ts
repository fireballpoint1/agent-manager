import { sequelize, DataTypes } from '../db';
import { Model, Optional } from 'sequelize';

export interface OtpAttributes {
  id: number;
  phone: string;
  code: string;
  expires_at: Date;
  verified?: boolean;
}

export interface OtpCreationAttributes extends Optional<OtpAttributes, 'id'> {}

export class Otp extends Model<OtpAttributes, OtpCreationAttributes> implements OtpAttributes {
  public id!: number;
  public phone!: string;
  public code!: string;
  public expires_at!: Date;
  public verified?: boolean;
}

Otp.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  phone: { type: DataTypes.STRING, allowNull: false },
  code: { type: DataTypes.STRING, allowNull: false },
  expires_at: { type: DataTypes.DATE, allowNull: false },
  verified: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  sequelize,
  tableName: 'otps',
  timestamps: false,
}); 