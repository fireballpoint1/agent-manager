import express from 'express';
import { taskController } from '../controllers/taskController';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         agent_id:
 *           type: integer
 *         status:
 *           type: string
 *         lat:
 *           type: number
 *         lng:
 *           type: number
 *         created_at:
 *           type: string
 *           format: date-time
 */
/**
 * @swagger
 * /tasks/assigned:
 *   get:
 *     summary: List agent’s assigned tasks
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: agentId
 *         schema:
 *           type: integer
 *         required: false
 *         description: Agent ID (defaults to 1 if not provided)
 *     responses:
 *       200:
 *         description: List of assigned tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 */
router.get('/assigned', taskController.listAssigned);

/**
 * @swagger
 * /tasks/{id}/start-visit:
 *   post:
 *     summary: Begin a visit, validate geolocation (~100m radius)
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lat
 *               - lng
 *             properties:
 *               lat:
 *                 type: number
 *               lng:
 *                 type: number
 *     responses:
 *       200:
 *         description: Visit started
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 */
router.post('/:id/start-visit', taskController.startVisit);

/**
 * @swagger
 * /tasks/{id}/check-in:
 *   post:
 *     summary: Mark task as in-progress
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task checked in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 */
router.post('/:id/check-in', taskController.checkIn);

/**
 * @swagger
 * /tasks/{id}/complete:
 *   post:
 *     summary: Complete task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 */
router.post('/:id/complete', taskController.complete);

/**
 * @swagger
 * /tasks/sync:
 *   post:
 *     summary: Push offline-saved task data
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - offlineTasks
 *               - agentId
 *             properties:
 *               offlineTasks:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     status:
 *                       type: string
 *               agentId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Tasks synced
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post('/sync', taskController.sync);

export default router; 