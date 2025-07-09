import { sequelize, DataTypes } from '../db';
import { Model, Optional } from 'sequelize';
import { Task } from './Task';

export interface TaskLogAttributes {
  id: number;
  task_id: number;
  action: string;
  timestamp?: Date;
  details?: object;
}

export interface TaskLogCreationAttributes extends Optional<TaskLogAttributes, 'id'> {}

export class TaskLog extends Model<TaskLogAttributes, TaskLogCreationAttributes> implements TaskLogAttributes {
  public id!: number;
  public task_id!: number;
  public action!: string;
  public timestamp?: Date;
  public details?: object;
}

TaskLog.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  task_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'tasks', key: 'id' } },
  action: { type: DataTypes.STRING, allowNull: false },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  details: { type: DataTypes.JSONB },
}, {
  sequelize,
  tableName: 'task_logs',
  timestamps: false,
});

TaskLog.belongsTo(Task, { foreignKey: 'task_id' });
Task.hasMany(TaskLog, { foreignKey: 'task_id' }); 