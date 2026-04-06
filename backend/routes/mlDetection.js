/**
 * ML Detection Processing Routes
 * Main endpoint for camera feed processing and ML model coordination
 */

import express from 'express';
import MLDetectionLog from '../models/MLDetectionLog.js';
import TrafficViolation from '../models/TrafficViolation.js';
import HelmetViolation from '../models/HelmetViolation.js';
import StreetEncroachment from '../models/StreetEncroachment.js';
import Camera from '../models/Camera.js';
import {
  processVehicleDetection,
  processHelmetDetection,
  extractNumberPlates,
  processSpeedDetection,
  processSignalViolation,
  processCrowdDetection,
  updateCameraHeartbeat
} from '../services/mlCameraService.js';
import MLModelInference from '../services/mlModelInference.js';
import { io } from '../server.js';

const router = express.Router();
const mlInference = new MLModelInference();

/**
 * POST /api/ml-detection/process-frame
 * Main endpoint for processing camera frames with all ML models
 * Receives base64 frame data or frame URL
 */
router.post('/process-frame', async (req, res) => {
  try {
    const {
      cameraId,
      frameData,
      frameUrl,
      location,
      latitude,
      longitude,
      signalStatus,
      speedLimit,
      cameraCalibration,
      fps
    } = req.body;

    if (!cameraId || (!frameData && !frameUrl)) {
      return res.status(400).json({ message: 'Missing required fields: cameraId and frameData/frameUrl' });
    }

    // Update camera heartbeat
    await updateCameraHeartbeat(cameraId);

    // Get camera configuration
    const camera = await Camera.findOne({ cameraId });
    if (!camera) {
      return res.status(404).json({ message: 'Camera not registered' });
    }

    const detectionResults = {
      cameraId,
      timestamp: new Date(),
      violations: [],
      detections: {}
    };

    // Prepare frame data for ML models
    const mlFrameData = {
      frameUrl: frameUrl || frameData,
      location,
      latitude,
      longitude,
      fps: fps || 30,
      cameraCalibration,
      violationZoneMask: null,
      historicData: []
    };

    // 1. VEHICLE DETECTION (YOLOv8)
    if (camera.mlModelsEnabled.vehicleDetection) {
      try {
        const vehicles = await processVehicleDetection(cameraId, mlFrameData, mlInference);
        detectionResults.detections.vehicles = vehicles;
      } catch (error) {
        console.error('Vehicle detection failed:', error);
      }
    }

    // 2. HELMET DETECTION (for 2-wheelers)
    if (camera.mlModelsEnabled.helmetDetection && detectionResults.detections.vehicles) {
      try {
        const helmetResults = await processHelmetDetection(
          cameraId,
          mlFrameData,
          detectionResults.detections.vehicles,
          mlInference
        );
        detectionResults.detections.helmets = helmetResults;

        // Filter helmet violations
        const helmetViolations = helmetResults.filter(h => h.violationId);
        detectionResults.violations.push(...helmetViolations.map(v => ({
          type: 'helmet',
          violationId: v.violationId
        })));

        // Emit real-time alert
        if (helmetViolations.length > 0) {
          io.emit('helmet_violation_detected', {
            cameraId,
            count: helmetViolations.length,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error('Helmet detection failed:', error);
      }
    }

    // 3. NUMBER PLATE EXTRACTION (OCR)
    if (camera.mlModelsEnabled.numberPlateExtraction && detectionResults.detections.vehicles) {
      try {
        const plateResults = await extractNumberPlates(
          cameraId,
          mlFrameData,
          detectionResults.detections.vehicles,
          mlInference
        );
        detectionResults.detections.plates = plateResults;

        // Update vehicle objects with plate numbers
        plateResults.forEach(plate => {
          const vehicle = detectionResults.detections.vehicles.find(v => v.id === plate.vehicleId);
          if (vehicle) vehicle.plateNumber = plate.plateNumber;
        });
      } catch (error) {
        console.error('Number plate extraction failed:', error);
      }
    }

    // 4. SPEED DETECTION
    if (camera.mlModelsEnabled.speedDetection && speedLimit && detectionResults.detections.vehicles) {
      try {
        const speedingVehicles = await processSpeedDetection(
          cameraId,
          mlFrameData,
          detectionResults.detections.vehicles,
          speedLimit,
          mlInference
        );
        detectionResults.detections.speeding = speedingVehicles;

        detectionResults.violations.push(...speedingVehicles.map(v => ({
          type: 'speeding',
          violationId: v.violationId
        })));

        // Emit real-time alert
        if (speedingVehicles.length > 0) {
          io.emit('speeding_detected', {
            cameraId,
            count: speedingVehicles.length,
            maxSpeed: Math.max(...speedingVehicles.map(v => v.speed)),
            speedLimit: speedLimit,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error('Speed detection failed:', error);
      }
    }

    // 5. SIGNAL VIOLATION DETECTION
    if (signalStatus && detectionResults.detections.vehicles) {
      try {
        const signalViolations = await processSignalViolation(
          cameraId,
          mlFrameData,
          detectionResults.detections.vehicles,
          signalStatus,
          mlInference
        );
        detectionResults.detections.signalViolations = signalViolations;

        detectionResults.violations.push(...signalViolations.map(v => ({
          type: 'signal_violation',
          violationId: v.violationId
        })));

        // Emit real-time alert
        if (signalViolations.length > 0) {
          io.emit('signal_violation_detected', {
            cameraId,
            count: signalViolations.length,
            signal: signalStatus,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error('Signal violation detection failed:', error);
      }
    }

    // 6. CROWD DETECTION (Street Encroachment)
    if (camera.mlModelsEnabled.crowdDetection) {
      try {
        const crowdResult = await processCrowdDetection(cameraId, mlFrameData, mlInference);
        if (crowdResult) {
          detectionResults.detections.crowd = crowdResult;
          detectionResults.violations.push({
            type: 'street_encroachment',
            encroachmentId: crowdResult.encroachmentId
          });

          // Emit real-time alert
          if (crowdResult.roadBlockagePercentage > 30) {
            io.emit('street_encroachment_detected', {
              cameraId,
              crowdSize: crowdResult.crowdSize,
              blockagePercentage: crowdResult.roadBlockagePercentage,
              severity: crowdResult.crowdSize > 10 ? 'high' : 'medium',
              timestamp: new Date()
            });
          }
        }
      } catch (error) {
        console.error('Crowd detection failed:', error);
      }
    }

    // 7. CONGESTION DETECTION
    if (detectionResults.detections.vehicles) {
      try {
        const congestionAnalysis = await mlInference.detectCongestion(mlFrameData);
        if (congestionAnalysis.congestionLevel > 0) {
          detectionResults.detections.congestion = congestionAnalysis;

          // Log high congestion
          if (congestionAnalysis.congestionLevel > 75) {
            await MLDetectionLog.create({
              cameraId,
              detectionType: 'congestion_high',
              detectionDetails: congestionAnalysis,
              frameUrl: frameUrl || frameData,
              processingStatus: 'completed'
            });

            io.emit('high_congestion_alert', {
              cameraId,
              congestionLevel: congestionAnalysis.congestionLevel,
              vehicleCount: congestionAnalysis.vehicleCount,
              estimatedWaitTime: congestionAnalysis.estimatedWaitTime,
              timestamp: new Date()
            });
          }
        }
      } catch (error) {
        console.error('Congestion detection failed:', error);
      }
    }

    // Increment camera violation counter
    if (detectionResults.violations.length > 0) {
      await Camera.updateOne(
        { cameraId },
        { $inc: { totalViolationsDetected: detectionResults.violations.length } }
      );
    }

    res.json({
      message: 'Frame processed successfully',
      processedAt: new Date(),
      cameraId,
      violationsDetected: detectionResults.violations.length,
      detections: detectionResults.detections,
      violations: detectionResults.violations
    });
  } catch (error) {
    console.error('Error processing frame:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

/**
 * GET /api/ml-detection/logs
 * Get ML detection logs
 */
router.get('/logs', async (req, res) => {
  try {
    const {
      cameraId,
      detectionType,
      startDate,
      endDate,
      limit = 100,
      page = 1
    } = req.query;

    const filter = {};

    if (cameraId) filter.cameraId = cameraId;
    if (detectionType) filter.detectionType = detectionType;

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const logs = await MLDetectionLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await MLDetectionLog.countDocuments(filter);

    res.json({
      logs,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page)
      }
    });
  } catch (error) {
    console.error('Error fetching detection logs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET /api/ml-detection/statistics
 * Get ML detection statistics
 */
router.get('/statistics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const byType = await MLDetectionLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$detectionType',
          count: { $sum: 1 }
        }
      }
    ]);

    const byCameras = await MLDetectionLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$cameraId',
          detections: { $sum: 1 },
          violations: { $sum: { $cond: ['$violationCreated', 1, 0] } }
        }
      }
    ]);

    res.json({
      detectionsByType: byType,
      detectionsByCamera: byCameras
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
