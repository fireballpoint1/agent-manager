import { sequelize, DataTypes } from '../db';
import { Model, Optional } from 'sequelize';
import { Agent } from './Agent';

export interface SyncQueueAttributes {
  id: number;
  agent_id: number;
  payload: object;
  synced?: boolean;
  created_at?: Date;
}

export interface SyncQueueCreationAttributes extends Optional<SyncQueueAttributes, 'id'> {}

export class SyncQueue extends Model<SyncQueueAttributes, SyncQueueCreationAttributes> implements SyncQueueAttributes {
  public id!: number;
  public agent_id!: number;
  public payload!: object;
  public synced?: boolean;
  public created_at?: Date;
}

SyncQueue.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  agent_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'agents', key: 'id' } },
  payload: { type: DataTypes.JSONB, allowNull: false },
  synced: { type: DataTypes.BOOLEAN, defaultValue: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  sequelize,
  tableName: 'sync_queue',
  timestamps: false,
});

SyncQueue.belongsTo(Agent, { foreignKey: 'agent_id' });
Agent.hasMany(SyncQueue, { foreignKey: 'agent_id' }); 