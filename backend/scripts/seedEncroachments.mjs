import mongoose from 'mongoose';
import Encroachment from '../models/Encroachment.js';
import Camera from '../models/Camera.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function seedEncroachments() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    // Clear existing encroachments to avoid duplicates
    await Encroachment.deleteMany({});
    
    const encroachments = [
      {
        cameraId: 'CAM-STN-001',
        location: 'Oasis Mall Main Gate',
        zone: 'footpath',
        detectedObject: 'hawker',
        imageUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=800',
        status: 'detected',
        severity: 'medium',
        stationaryDuration: 1200,
        coordinates: { lat: 17.676673, lng: 75.8986813 }
      },
      {
        cameraId: 'CAM-MKT-002',
        location: 'City Corner Market',
        zone: 'road-lane',
        detectedObject: 'vendor',
        imageUrl: 'https://images.unsplash.com/photo-1510003058444-4cb450c2688f?q=80&w=800',
        status: 'warning-issued',
        severity: 'high',
        stationaryDuration: 3600,
        coordinates: { lat: 17.6796, lng: 75.9088 }
      },
      {
        cameraId: 'CAM-HWY-004',
        location: 'GMR Mall Entrance',
        zone: 'no-parking',
        detectedObject: 'vehicle',
        licensePlate: 'MH-13-AZ-1234',
        imageUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=800',
        status: 'alert-sent',
        severity: 'high',
        stationaryDuration: 450,
        coordinates: { lat: 17.6743, lng: 75.9138 }
      }
    ];

    await Encroachment.insertMany(encroachments);
    console.log('✅ Encroachment data seeded to Atlas successfully!');

  } catch (error) {
    console.error('Error seeding encroachments:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedEncroachments();
