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
import encroachmentRoutes from './routes/encroachment.js';
import illegalParkingRoutes from './routes/illegalParking.js';
import paymentRoutes, { razorpayWebhookHandler } from './routes/payments.js';
import auditRoutes from './routes/audit.js';
import roadIssueRoutes from './routes/roadIssues.js';
import cameraRoutes from './routes/cameras.js';
import violationsRoutes from './routes/violations.js';
import streetEncroachmentRoutes from './routes/streetEncroachment.js';
import trafficSignalsRoutes from './routes/trafficSignals.js';
import mlDetectionRoutes from './routes/mlDetection.js';
import documentRoutes from './routes/documentRoutes.js';
import citizenReportRoutes from './routes/citizenReportRoutes.js';
import signalCoordinationRoutes from './routes/signalCoordinationRoutes.js';
import challanRoutes from './routes/challanRoutes.js';
import adminReportsRoutes from './routes/adminReports.js';
import emergencyVehicleRoutes from './routes/emergencyRoutes.js';
import parkingAmenitiesRoutes from './routes/parkingAmenities.js';
import { initializeTrafficSimulation } from './services/trafficSimulator.js';
import { ensureUploadDirs } from './services/uploadService.js';
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      mongodb: mongoose.connection.readyState === 1,
      socketio: !!io,
      ml_backend: true // We'll check this later
    }
  });
});

// Webhook route must parse the raw body for signature verification.
app.post(
  '/api/payments/webhook/razorpay',
  express.raw({ type: 'application/json' }),
  razorpayWebhookHandler
);

// Increase JSON body size limit to handle base64 encoded images/video frames
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Ensure required directories exist
ensureUploadDirs();

app.use('/public', express.static('public'));
app.use('/uploads', express.static('uploads'));

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
app.use('/api/parking-amenities', parkingAmenitiesRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/encroachments', encroachmentRoutes);
app.use('/api/illegal-parking', illegalParkingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/road-issues', roadIssueRoutes);

// ML-based traffic and parking enforcement system
app.use('/api/cameras', cameraRoutes);
app.use('/api/violations', violationsRoutes);
app.use('/api/street-encroachment', streetEncroachmentRoutes);
app.use('/api/traffic-signals', trafficSignalsRoutes);
app.use('/api/ml-detection', mlDetectionRoutes);

// Citizen document management and reporting
app.use('/api/documents', documentRoutes);
app.use('/api/citizen-reports', citizenReportRoutes);

// Signal coordination for zero traffic optimization
app.use('/api/signal-coordination', signalCoordinationRoutes);

// Challan management and payment
app.use('/api/challans', challanRoutes);

// Admin reports and daily analytics
app.use('/api/admin-reports', adminReportsRoutes);

// Emergency vehicle detection and green corridor management
app.use('/api/emergency-vehicles', emergencyVehicleRoutes);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

httpServer.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${env.PORT} is already in use. Please stop the running server or set PORT to a different value.`);
  } else {
    console.error('HTTP server error:', error);
  }
  process.exit(1);
});

async function startServer() {
  try {
    // Validate required environment variables BEFORE connecting
    const requiredEnvVars = ['MONGODB_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
    const missing = requiredEnvVars.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // Connect to MongoDB with detailed error handling
    console.log('🔌 Connecting to MongoDB...');
    console.log('📍 URI:', env.MONGODB_URI.split('@')[0] + '@' + (env.MONGODB_URI.split('@')[1] ? env.MONGODB_URI.split('@')[1].substring(0, 20) + '...' : 'unknown'));
    
    try {
      const connectPromise = mongoose.connect(env.MONGODB_URI, {
        connectTimeoutMS: 15000,
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        retryWrites: true,
        maxPoolSize: 10,
        family: 4 // Use IPv4
      });

      // Add timeout fallback
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('MongoDB connection timeout (15s)')), 16000)
      );

      await Promise.race([connectPromise, timeoutPromise]);
      console.log('✅ MongoDB connected successfully');
    } catch (dbError) {
      console.error('❌ MongoDB Connection Error:', dbError.message);
      console.error('📝 Connection Details:');
      console.error('   - MONGODB_URI set:', !!process.env.MONGODB_URI);
      console.error('   - Error type:', dbError.name);
      console.error('   - Full error:', dbError.toString());
      throw dbError;
    }

    await seedDefaultUsers();
    await initializeTrafficSimulation(io);

    const server = httpServer.listen(env.PORT, '0.0.0.0', () => {
      console.log('====================================================');
      console.log(`✅ SERVER RUNNING ON PORT ${env.PORT}`);
      console.log(`📡 Socket.IO: ONLINE`);
      console.log(`💳 Payment Provider: ${env.PAYMENT_PROVIDER}`);
      console.log(`🌍 Traffic Simulation: LOADED`);
      console.log('====================================================');
    });

    // Graceful shutdown handlers
    const shutdown = async (signal) => {
      console.log(`\n📤 Received ${signal}, shutting down gracefully...`);
      server.close(async () => {
        try {
          await mongoose.disconnect();
          console.log('✅ Server closed successfully');
          process.exit(0);
        } catch (error) {
          console.error('Error during shutdown:', error);
          process.exit(1);
        }
      });
      
      // Force exit after 10 seconds
      setTimeout(() => {
        console.error('❌ Force closing server after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

startServer();

export { io };
