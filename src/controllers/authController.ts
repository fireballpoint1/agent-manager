import { Request, Response } from 'express';
import { Otp } from '../models/Otp';
import { Agent } from '../models/Agent';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import redis from 'redis';
import bcrypt from 'bcryptjs';

const redisClient = redis.createClient({ url: process.env.REDIS_URL });
redisClient.connect();

const OTP_EXPIRY_MINUTES = 5;
const OTP_RATE_LIMIT = 3; // max 3 OTPs per 10 min
const OTP_RATE_WINDOW = 10 * 60; // 10 min in seconds
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refreshsecret';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const authController = {
  async requestOtp(req: Request, res: Response) {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone required' });
    // Rate limit by phone
    const key = `otp:rate:${phone}`;
    const count = parseInt(await redisClient.get(key) as string) || 0;
    if (count >= OTP_RATE_LIMIT) {
      return res.status(429).json({ error: 'Too many OTP requests. Try later.' });
    }
    await redisClient.set(key, (count + 1).toString(), { EX: OTP_RATE_WINDOW });
    // Generate and store OTP
    const code = generateOtp();
    const expires_at = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000);
    await Otp.create({ phone, code, expires_at });
    // Ensure agent exists
    let agent = await Agent.findOne({ where: { phone } });
    if (!agent) agent = await Agent.create({ name: phone, phone });
    // Mock: send OTP (in real app, send SMS)
    res.json({ message: 'OTP sent', phone, code });
  },

  async verifyOtp(req: Request, res: Response) {
    const { phone, code } = req.body;
    if (!phone || !code) return res.status(400).json({ error: 'Phone and code required' });
    const otp = await Otp.findOne({
      where: {
        phone,
        code,
        expires_at: { [Op.gt]: new Date() },
        verified: false,
      },
      order: [['expires_at', 'DESC']],
    });
    if (!otp) return res.status(400).json({ error: 'Invalid or expired OTP' });
    otp.verified = true;
    await otp.save();
    // Find agent
    const agent = await Agent.findOne({ where: { phone } });
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    // Issue JWTs
    const payload = { agentId: agent.id, role: 'agent' };
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
    // (Optional: store refreshToken in DB for revocation)
    res.json({ accessToken, refreshToken, agent: { id: agent.id, phone: agent.phone, name: agent.name } });
  },
}; 