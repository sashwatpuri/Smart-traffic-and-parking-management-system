import mongoose from 'mongoose';

const fineSchema = new mongoose.Schema({
  fineId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vehicleNumber: { type: String, required: true },
  violationType: { 
    type: String, 
    enum: [
      'illegal_parking',
      'no_parking_zone',
      'double_parking',
      'overtime_parking',
      'high_speed',
      'no_helmet',
      'rush_driving'
    ],
    required: true 
  },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  location: {
    name: String,
    lat: Number,
    lng: Number
  },
  status: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' },
  warningIssued: { type: Boolean, default: false },
  warningTime: Date,
  imageUrl: String,
  issuedAt: { type: Date, default: Date.now },
  paidAt: Date
});

export default mongoose.model('Fine', fineSchema);
