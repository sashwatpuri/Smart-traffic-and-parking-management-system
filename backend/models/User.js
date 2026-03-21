import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['admin', 'citizen'],
      default: 'citizen',
      index: true
    },
    phone: {
      type: String,
      trim: true
    },
    vehicleNumber: {
      type: String,
      uppercase: true,
      trim: true,
      sparse: true,
      index: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: Date,
    profilePicture: String
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Sanitize user data (remove password from response)
userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ vehicleNumber: 1 });
userSchema.index({ role: 1, isActive: 1 });

export default mongoose.model('User', userSchema);
