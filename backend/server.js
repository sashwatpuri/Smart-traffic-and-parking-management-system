import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import trafficRoutes from './routes/traffic.js';
import parkingRoutes from './routes/parking.js';
import fineRoutes from './routes/fines.js';
import emergencyRoutes from './routes/emergency.js';
import paymentRoutes, { razorpayWebhookHandler } from './routes/payments.js';
import auditRoutes from './routes/audit.js';
import { initializeTrafficSimulation } from './services/trafficSimulator.js';
import User from './models/User.js';
import { env } from './config/env.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: env.CORS_ORIGIN }
});

const corsOptions = {
  origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',').map((item) => item.trim())
};

app.use(cors(corsOptions));

// Webhook route must parse the raw body for signature verification.
app.post(
  '/api/payments/webhook/razorpay',
  express.raw({ type: 'application/json' }),
  razorpayWebhookHandler
);

app.use(express.json());

async function seedDefaultUsers() {
  const adminExists = await User.findOne({ email: env.DEFAULT_ADMIN_EMAIL });
  if (!adminExists) {
    const admin = new User({
      name: 'Admin',
      email: env.DEFAULT_ADMIN_EMAIL,
      password: env.DEFAULT_ADMIN_PASSWORD,
      role: 'admin',
      phone: env.DEFAULT_ADMIN_PHONE
    });
    await admin.save();
    console.log(`Default admin user created (${env.DEFAULT_ADMIN_EMAIL})`);
  }

  const citizenExists = await User.findOne({ email: env.DEFAULT_CITIZEN_EMAIL });
  if (!citizenExists) {
    const citizen = new User({
      name: 'Citizen',
      email: env.DEFAULT_CITIZEN_EMAIL,
      password: env.DEFAULT_CITIZEN_PASSWORD,
      role: 'citizen',
      phone: env.DEFAULT_CITIZEN_PHONE
    });
    await citizen.save();
    console.log(`Default citizen user created (${env.DEFAULT_CITIZEN_EMAIL})`);
  }
}

app.use('/api/auth', authRoutes);
app.use('/api/traffic', trafficRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/audit', auditRoutes);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

async function startServer() {
  await mongoose.connect(env.MONGODB_URI);
  console.log('MongoDB connected');

  await seedDefaultUsers();
  await initializeTrafficSimulation(io);

  httpServer.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
    console.log(`Payment provider: ${env.PAYMENT_PROVIDER}`);
  });
}

startServer().catch((error) => {
  console.error('Server startup failed:', error);
  process.exit(1);
});

export { io };
