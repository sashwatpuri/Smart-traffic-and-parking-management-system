import mongoose from 'mongoose';

const paymentTransactionSchema = new mongoose.Schema(
  {
    transactionType: {
      type: String,
      enum: ['parking', 'fine'],
      required: true,
      index: true
    },
    referenceId: {
      type: String,
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    provider: {
      type: String,
      enum: ['mock', 'razorpay'],
      default: 'mock'
    },
    providerOrderId: {
      type: String,
      unique: true,
      sparse: true
    },
    providerPaymentId: String,
    providerSignature: String,
    amount: {
      type: Number,
      required: true
    },
    amountPaise: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    status: {
      type: String,
      enum: ['created', 'success', 'failed', 'cancelled'],
      default: 'created',
      index: true
    },
    webhookVerified: {
      type: Boolean,
      default: false
    },
    metadata: mongoose.Schema.Types.Mixed,
    paidAt: Date
  },
  { timestamps: true }
);

export default mongoose.model('PaymentTransaction', paymentTransactionSchema);
