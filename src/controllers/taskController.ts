import { Response, Request } from 'express';
import { Task, TaskStatus } from '../models/Task';
import { TaskLog } from '../models/TaskLog';
import { SyncQueue } from '../models/SyncQueue';
import { Agent } from '../models/Agent';
import { AuthRequest } from '../middleware/auth';
import { TaskDto } from '../dto/TaskDto';

// Helper: Haversine formula for geolocation validation
function isWithinRadius(lat1: number, lng1: number, lat2: number, lng2: number, radiusMeters = 100): boolean {
  function toRad(x: number) { return x * Math.PI / 180; }
  const R = 6371000; // meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return (R * c) <= radiusMeters;
}

export const taskController = {
  async listAssigned(req: AuthRequest, res: Response) {
    const agentId = req.user?.agentId;
    if (!agentId) return res.status(401).json({ error: 'Unauthorized' });
    const tasks = await Task.findAll({ where: { agent_id: agentId, status: TaskStatus.ASSIGNED } });
    res.json(tasks);
  },

  async startVisit(req: AuthRequest, res: Response) {
    const agentId = req.user?.agentId;
    if (!agentId) return res.status(401).json({ error: 'Unauthorized' });
    const id = parseInt(req.params.id);
    const { lat, lng } = req.body;
    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (task.agent_id !== agentId) return res.status(403).json({ error: 'Forbidden' });
    if (!lat || !lng) return res.status(400).json({ error: 'Missing lat/lng' });
    if (!isWithinRadius(task.lat!, task.lng!, lat, lng)) {
      return res.status(400).json({ error: 'Not within 100m of task location' });
    }
    await task.update({ status: TaskStatus.VISIT_STARTED });
    await TaskLog.create({ task_id: id, action: TaskStatus.VISIT_STARTED, details: { lat, lng } });
    res.json({ message: 'Visit started', task: { ...task.toJSON(), status: TaskStatus.VISIT_STARTED } });
  },

  async checkIn(req: AuthRequest, res: Response) {
    const agentId = req.user?.agentId;
    if (!agentId) return res.status(401).json({ error: 'Unauthorized' });
    const id = parseInt(req.params.id);
    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (task.agent_id !== agentId) return res.status(403).json({ error: 'Forbidden' });
    await task.update({ status: TaskStatus.IN_PROGRESS });
    await TaskLog.create({ task_id: id, action: TaskStatus.IN_PROGRESS });
    res.json({ message: 'Task checked in', task: { ...task.toJSON(), status: TaskStatus.IN_PROGRESS } });
  },

  async complete(req: AuthRequest, res: Response) {
    const agentId = req.user?.agentId;
    if (!agentId) return res.status(401).json({ error: 'Unauthorized' });
    const id = parseInt(req.params.id);
    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (task.agent_id !== agentId) return res.status(403).json({ error: 'Forbidden' });
    await task.update({ status: TaskStatus.COMPLETED });
    await TaskLog.create({ task_id: id, action: TaskStatus.COMPLETED });
    res.json({ message: 'Task completed', task: { ...task.toJSON(), status: TaskStatus.COMPLETED } });
  },

  async sync(req: AuthRequest, res: Response) {
    const agentId = req.user?.agentId;
    if (!agentId) return res.status(401).json({ error: 'Unauthorized' });
    const { offlineTasks } = req.body;
    if (!Array.isArray(offlineTasks)) return res.status(400).json({ error: 'offlineTasks must be an array' });
    for (const ot of offlineTasks) {
      if (ot.id && ot.status) {
        const task = await Task.findByPk(ot.id);
        if (task && task.agent_id === agentId) {
          await task.update({ status: ot.status });
          await TaskLog.create({ task_id: ot.id, action: ot.status, details: ot.details || null });
        }
      }
    }
    if (offlineTasks.length > 0) {
      await SyncQueue.create({ agent_id: agentId, payload: offlineTasks });
    }
    res.json({ message: 'Tasks synced' });
  },

  async create(req: Request<{}, {}, TaskDto>, res: Response) {
    const dto = req.body;
    if (!dto.agentId) return res.status(400).json({ error: 'Missing agentId' });
    const agent = await Agent.findByPk(dto.agentId);
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    try {
      const task = await Task.create({ agent_id: dto.agentId, status: TaskStatus.ASSIGNED, lat: dto.lat, lng: dto.lng });
      res.status(201).json(task);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create task', details: err });
    }
  },
}; 