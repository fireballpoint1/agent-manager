import { sequelize, DataTypes } from '../db';
import { Model, Optional } from 'sequelize';
import { Agent } from './Agent';

export interface TaskAttributes {
  id: number;
  agent_id: number;
  status: string;
  lat?: number;
  lng?: number;
  created_at?: Date;
}

export interface TaskCreationAttributes extends Optional<TaskAttributes, 'id'> {}

export class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
  public id!: number;
  public agent_id!: number;
  public status!: string;
  public lat?: number;
  public lng?: number;
  public created_at?: Date;
}

Task.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  agent_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'agents', key: 'id' } },
  status: { type: DataTypes.STRING, allowNull: false },
  lat: { type: DataTypes.DOUBLE },
  lng: { type: DataTypes.DOUBLE },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  sequelize,
  tableName: 'tasks',
  timestamps: false,
});

Task.belongsTo(Agent, { foreignKey: 'agent_id' });
Agent.hasMany(Task, { foreignKey: 'agent_id' }); 