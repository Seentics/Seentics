import mongoose from 'mongoose';

const VisitorSchema = new mongoose.Schema(
  {
    siteId: { type: String, index: true, required: true },
    visitorId: { type: String, index: true, required: true },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

VisitorSchema.index({ siteId: 1, visitorId: 1 }, { unique: true });

export const Visitor = mongoose.models.Visitor || mongoose.model('Visitor', VisitorSchema);

