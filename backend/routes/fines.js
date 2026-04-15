import express from 'express';
import Fine from '../models/Fine.js';
import User from '../models/User.js';
import { io } from '../server.js';
import { authMiddleware, requirePermission } from '../middleware/auth.js';
import { env } from '../config/env.js';
import { logAudit } from '../services/auditLogger.js';
import { adminCitizenSyncService } from '../services/adminCitizenSyncService.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const canReadAll = req.user.permissions?.includes('fine:read');
    let filter = {};
    
    if (!canReadAll) {
      // For citizens, find fines matching their userId OR their vehicleNumber
      const user = await User.findById(req.user.userId);
      
      const orConditions = [{ userId: req.user.userId }];
      
      // Only filter by vehicleNumber if the user actually has one set
      if (user?.vehicleNumber && user.vehicleNumber.trim() !== "") {
        const normalizedVehicleNumber = user.vehicleNumber.replace(/[^A-Z0-9]/gi, '').toUpperCase();
        // Search for fines by exact vehicleNumber match (handles userId:null fines)
        orConditions.push({ vehicleNumber: normalizedVehicleNumber });
      }
      
      filter = { $or: orConditions };
    }

    const fines = await Fine.find(filter).populate('userId', 'name email').sort({ issuedAt: -1 });
    console.log(`[FINES] Citizen ${req.user.userId} fetched ${fines.length} fines`);
    res.json(fines);
  } catch (error) {
    console.error('[FINES] Error fetching fines:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/issue', authMiddleware, requirePermission('fine:issue'), async (req, res) => {
  try {
    let { vehicleNumber, violationType, amount, location, imageUrl } = req.body;
    
    // Validate required fields
    if (!vehicleNumber || !violationType || !amount) {
      return res.status(400).json({ message: 'Missing required fields: vehicleNumber, violationType, amount' });
    }
    
    // Normalize vehicle number (uppercase, no spaces/dashes)
    const normalizedNumber = vehicleNumber ? vehicleNumber.replace(/[^A-Z0-9]/gi, '').toUpperCase() : '';
    
    if (!normalizedNumber) {
      return res.status(400).json({ message: 'Invalid vehicle number format' });
    }
    
    console.log(`[FINE-ISSUE] Attempting to issue ₹${amount} fine for vehicle ${normalizedNumber}`);
    
    const owner = await User.findOne({ vehicleNumber: normalizedNumber });
    
    if (!owner) {
      console.warn(`[FINE-ISSUE] Owner not found for vehicle ${normalizedNumber} - fine will be issued with vehicleNumber match`);
    } else {
      console.log(`[FINE-ISSUE] Owner found: ${owner._id} (${owner.email})`);
    }

    const fineId = `FINE${Date.now()}`;
    const fine = new Fine({
      fineId,
      userId: owner?._id || null,
      vehicleNumber: normalizedNumber,
      violationType,
      amount,
      currency: 'INR',
      location: typeof location === 'string' ? { name: location } : location,
      imageUrl,
      status: 'pending',
      warningIssued: true,
      warningTime: new Date(),
      issuedAt: new Date()
    });

    const savedFine = await fine.save();
    console.log(`[FINE-ISSUE] ✅ Fine created: ${fineId} for ₹${amount}`);

    // Notify citizen in real-time - broadcast to all clients
    io.emit('new-fine', {
        userId: owner?._id?.toString(),
        vehicleNumber: normalizedNumber,
        fineId: fine.fineId,
        amount: fine.amount,
        timestamp: new Date()
    });
    console.log(`[REAL-TIME] Emitted 'new-fine' event for ${normalizedNumber}`);

    // Detailed sync via service
    try {
      await adminCitizenSyncService.syncChallan({
        challanNumber: fine.fineId,
        vehicleNumber: normalizedNumber,
        violation: violationType,
        fineAmount: amount,
        status: 'pending',
        createdAt: fine.issuedAt,
        userId: owner?._id?.toString()
      });
      console.log(`[FINE-ISSUE] Sync service completed for ${fineId}`);
    } catch (syncError) {
      console.error('[FINE-ISSUE] Fine sync service error:', syncError);
      // Don't fail the request if sync fails - it's secondary
    }

    await logAudit({
      req,
      action: 'fine.issue',
      resourceType: 'fine',
      resourceId: fine._id.toString(),
      metadata: {
        fineId: fine.fineId,
        vehicleNumber: normalizedNumber,
        amount,
        currency: 'INR',
        ownerFound: !!owner
      }
    });

    res.status(201).json({
      success: true,
      message: 'Fine issued successfully',
      fine: savedFine
    });
  } catch (error) {
    console.error('[FINE-ISSUE] Error issuing fine:', error);
    await logAudit({
      req,
      action: 'fine.issue',
      resourceType: 'fine',
      status: 'failure',
      metadata: { error: error.message }
    });
    res.status(500).json({ message: error.message, error: error.toString() });
  }
});

// Backward-compatible endpoint. Real payment flow is now handled by /api/payments/orders.
router.post('/:id/pay', authMiddleware, async (req, res) => {
  try {
    const fine = await Fine.findById(req.params.id);
    if (!fine) {
      return res.status(404).json({ message: 'Fine not found' });
    }

    const canPayAny = req.user.permissions?.includes('fine:pay:any');
    const canPayOwn = req.user.permissions?.includes('fine:pay:own');
    const ownsFine = fine.userId?.toString() === req.user.userId;

    if (!canPayAny && !(canPayOwn && ownsFine)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    if (env.PAYMENT_PROVIDER !== 'mock') {
      return res.status(400).json({
        message: 'Use /api/payments/orders for fine payments when payment provider is enabled'
      });
    }

    fine.status = 'paid';
    fine.paidAt = new Date();
    fine.currency = 'INR';
    await fine.save();

    console.log(`[REAL-TIME] Fine ${fine.fineId} marked as PAID. Broadcasting to all clients.`);
    io.emit('fine-updated', {
        fineId: fine.fineId,
        status: 'paid',
        userId: fine.userId
    });

    res.json({ message: 'Fine paid successfully', fine });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', authMiddleware, requirePermission('fine:cancel'), async (req, res) => {
  try {
    const deleted = await Fine.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Fine not found' });
    }

    await logAudit({
      req,
      action: 'fine.cancel',
      resourceType: 'fine',
      resourceId: req.params.id
    });

    console.log(`[REAL-TIME] Fine ${req.params.id} CANCELLED by Admin. Broadcasting.`);
    io.emit('fine-updated', {
        fineId: req.params.id,
        status: 'cancelled'
    });

    res.json({ message: 'Fine cancelled' });
  } catch (error) {
    await logAudit({
      req,
      action: 'fine.cancel',
      resourceType: 'fine',
      resourceId: req.params.id,
      status: 'failure',
      metadata: { error: error.message }
    });
    res.status(500).json({ message: error.message });
  }
});

export default router;
