import mongoose from 'mongoose';

const parkingSpotSchema = new mongoose.Schema({
  spotId: { type: String, required: true, unique: true },
  zone: String,
  location: {
    name: String,
    lat: Number,
    lng: Number
  },
  status: { type: String, enum: ['available', 'occupied', 'reserved'], default: 'available' },
  type: { type: String, enum: ['regular', 'disabled', 'ev'], default: 'regular' },
  pricePerHour: { type: Number, default: 20 },
  currency: { type: String, default: 'INR' },
  currentBooking: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    vehicleNumber: String,
    startTime: Date,
    endTime: Date,
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending'
    },
    paymentTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PaymentTransaction'
    }
  }
}, { timestamps: true });

export default mongoose.model('ParkingSpot', parkingSpotSchema);
