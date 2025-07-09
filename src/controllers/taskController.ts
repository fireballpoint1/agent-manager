import { Request, Response } from 'express';
import { Task } from '../models/Task';
import { TaskLog } from '../models/TaskLog';
import { SyncQueue } from '../models/SyncQueue';
import { Agent } from '../models/Agent';

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
  async listAssigned(req: Request, res: Response) {
    const agentId = parseInt(req.query.agentId as string) || 1;
    const tasks = await Task.findAll({ where: { agent_id: agentId, status: 'assigned' } });
    res.json(tasks);
  },

  async startVisit(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const { lat, lng } = req.body;
    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (!lat || !lng) return res.status(400).json({ error: 'Missing lat/lng' });
    if (!isWithinRadius(task.lat!, task.lng!, lat, lng)) {
      return res.status(400).json({ error: 'Not within 100m of task location' });
    }
    await task.update({ status: 'visit-started' });
    await TaskLog.create({ task_id: id, action: 'visit-started', details: { lat, lng } });
    res.json({ message: 'Visit started', task: { ...task.toJSON(), status: 'visit-started' } });
  },

  async checkIn(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    await task.update({ status: 'in-progress' });
    await TaskLog.create({ task_id: id, action: 'in-progress' });
    res.json({ message: 'Task checked in', task: { ...task.toJSON(), status: 'in-progress' } });
  },

  async complete(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    await task.update({ status: 'completed' });
    await TaskLog.create({ task_id: id, action: 'completed' });
    res.json({ message: 'Task completed', task: { ...task.toJSON(), status: 'completed' } });
  },

  async sync(req: Request, res: Response) {
    const { offlineTasks, agentId } = req.body;
    if (!Array.isArray(offlineTasks)) return res.status(400).json({ error: 'offlineTasks must be an array' });
    for (const ot of offlineTasks) {
      if (ot.id && ot.status) {
        const task = await Task.findByPk(ot.id);
        if (task) {
          await task.update({ status: ot.status });
          await TaskLog.create({ task_id: ot.id, action: ot.status, details: ot.details || null });
        }
      }
    }
    if (agentId && offlineTasks.length > 0) {
      await SyncQueue.create({ agent_id: agentId, payload: offlineTasks });
    }
    res.json({ message: 'Tasks synced' });
  },
}; 