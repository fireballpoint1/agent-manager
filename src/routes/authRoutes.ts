import express from 'express';
import { authController } from '../controllers/authController';

const router = express.Router();

/**
 * @swagger
 * /auth/request-otp:
 *   post:
 *     summary: Request OTP for login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *     responses:
 *       200:
 *         description: OTP sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 code:
 *                   type: string
 */
router.post('/request-otp', authController.requestOtp);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP and get JWT tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - code
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: JWT tokens and agent info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 agent:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     phone:
 *                       type: string
 *                     name:
 *                       type: string
 */
router.post('/verify-otp', authController.verifyOtp);

export default router; 