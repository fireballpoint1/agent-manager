import { sequelize, DataTypes } from '../db';
import { Model, Optional } from 'sequelize';

export interface AgentAttributes {
  id: number;
  name: string;
  phone: string;
}

export interface AgentCreationAttributes extends Optional<AgentAttributes, 'id'> {}

export class Agent extends Model<AgentAttributes, AgentCreationAttributes> implements AgentAttributes {
  public id!: number;
  public name!: string;
  public phone!: string;
}

Agent.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
}, {
  sequelize,
  tableName: 'agents',
  timestamps: false,
}); 