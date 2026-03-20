import mongoose from 'mongoose';

const trafficSignalSchema = new mongoose.Schema({
  signalId: { type: String, required: true, unique: true },
  location: {
    name: String,
    lat: Number,
    lng: Number
  },
  status: { type: String, enum: ['green', 'yellow', 'red'], default: 'green' },
  currentTimer: { type: Number, default: 30 },
  vehicleCount: { type: Number, default: 0 },
  congestionLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  connectedSignals: [String],
  mode: { type: String, enum: ['auto', 'manual', 'emergency'], default: 'auto' },
  lastUpdated: { type: Date, default: Date.now }
});

export default mongoose.model('TrafficSignal', trafficSignalSchema);
