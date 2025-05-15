import mongoose from 'mongoose';

const RangesSchema = new mongoose.Schema({
  healthMetric: { type: String, required: true },
  ageGroup: { type: String, required: true },
  normalMin: { type: Number },
  normalMax: { type: Number },
  units: { type: String }
}, { timestamps: true });

const rangesModel= mongoose.model('Ranges', RangesSchema);
export default rangesModel;


