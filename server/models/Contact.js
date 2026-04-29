import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { _id: true }
);

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    status: {
      type: String,
      enum: ['lead', 'contacted', 'qualified', 'customer', 'lost'],
      default: 'lead',
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: [noteSchema],
  },
  { timestamps: true }
);

export default mongoose.model('Contact', contactSchema);
