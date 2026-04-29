import mongoose from 'mongoose';

const dealSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    value: { type: Number, required: true, min: 0 },
    stage: {
      type: String,
      enum: ['new', 'contacted', 'proposal', 'negotiation', 'closed-won', 'closed-lost'],
      default: 'new',
    },
    contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true },
    expectedCloseDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('Deal', dealSchema);
