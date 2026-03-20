import express from 'express';
import Emergency from '../models/Emergency.js';
import TrafficSignal from '../models/TrafficSignal.js';
import { authMiddleware, requirePermission } from '../middleware/auth.js';
import { io } from '../server.js';
import { logAudit } from '../services/auditLogger.js';

const router = express.Router();

router.get('/', authMiddleware, requirePermission('emergency:read'), async (req, res) => {
  try {
    const emergencies = await Emergency.find({ status: 'active' }).sort({ startTime: -1 });
    res.json(emergencies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/activate', authMiddleware, requirePermission('emergency:activate'), async (req, res) => {
  try {
    const { vehicleId, vehicleType, currentLocation, destination, route } = req.body;

    const emergency = new Emergency({
      vehicleId,
      vehicleType,
      currentLocation,
      destination,
      route,
      estimatedArrival: new Date(Date.now() + 15 * 60 * 1000)
    });

    await emergency.save();

    for (const point of route) {
      await TrafficSignal.findOneAndUpdate(
        { signalId: point.signalId },
        { status: 'green', mode: 'emergency' }
      );
    }

    io.emit('emergency-activated', emergency);

    await logAudit({
      req,
      action: 'emergency.activate',
      resourceType: 'emergency',
      resourceId: emergency._id.toString(),
      metadata: { vehicleId, vehicleType, routeLength: route?.length || 0 }
    });

    res.status(201).json(emergency);
  } catch (error) {
    await logAudit({
      req,
      action: 'emergency.activate',
      resourceType: 'emergency',
      status: 'failure',
      metadata: { error: error.message }
    });
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/complete', authMiddleware, requirePermission('emergency:complete'), async (req, res) => {
  try {
    const emergency = await Emergency.findByIdAndUpdate(
      req.params.id,
      { status: 'completed', endTime: new Date() },
      { new: true }
    );

    if (!emergency) {
      return res.status(404).json({ message: 'Emergency not found' });
    }

    io.emit('emergency-completed', emergency);

    await logAudit({
      req,
      action: 'emergency.complete',
      resourceType: 'emergency',
      resourceId: emergency._id.toString()
    });

    res.json(emergency);
  } catch (error) {
    await logAudit({
      req,
      action: 'emergency.complete',
      resourceType: 'emergency',
      resourceId: req.params.id,
      status: 'failure',
      metadata: { error: error.message }
    });
    res.status(500).json({ message: error.message });
  }
});

export default router;
