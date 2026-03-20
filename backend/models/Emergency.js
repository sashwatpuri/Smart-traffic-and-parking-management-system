import mongoose from 'mongoose';

const emergencySchema = new mongoose.Schema({
  vehicleId: { type: String, required: true },
  vehicleType: { type: String, enum: ['ambulance', 'fire_truck', 'police'], required: true },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  currentLocation: {
    lat: Number,
    lng: Number
  },
  destination: {
    lat: Number,
    lng: Number,
    address: String
  },
  route: [{
    signalId: String,
    lat: Number,
    lng: Number,
    cleared: { type: Boolean, default: false }
  }],
  estimatedArrival: Date,
  startTime: { type: Date, default: Date.now },
  endTime: Date
});

export default mongoose.model('Emergency', emergencySchema);
