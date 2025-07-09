import express, { Request, Response } from 'express';
import { sequelize } from './db';
import redis from 'redis';
import taskRoutes from './routes/taskRoutes';
import authRoutes from './routes/authRoutes';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

// Swagger setup
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Assessment API',
      version: '1.0.0',
      description: 'API documentation for Node.js, Postgres, Redis, OTP Auth app',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local server' },
    ],
  },
  apis: ['./src/routes/*.ts'],
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Sequelize sync
sequelize.authenticate()
  .then(() => {
    console.log('Connected to PostgreSQL via Sequelize');
    return sequelize.sync();
  })
  .then(() => console.log('Sequelize models synced'))
  .catch(err => console.error('Sequelize connection error:', err));

// Redis setup
const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
});
redisClient.connect()
  .then(() => console.log('Connected to Redis'))
  .catch((err: Error) => console.error('Redis connection error:', err));

// Routes
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Node.js with Postgres and Redis!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
});
