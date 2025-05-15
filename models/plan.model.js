import mongoose from 'mongoose';


const planSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    ref: 'patients'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  diabetesSpecialistVersion: {
    type: Map,
    of: String,
    required: true
  },
  cardiologySpecialistVersion: {
    type: Map,
    of: String,
    required: true
  },
  patientVersion: {
    type: Map,
    of: String,
    required: true
  },
  nutritionTargets: {
    dailyCalories: { type: Number, required: true },
    targetWeight: { type: Number, required: true },
    weightGoal: { type: String, required: true }
  },
  
}, {
  timestamps: true
});

const Plan = mongoose.models.Plan || mongoose.model('Plan', planSchema);
export default Plan;
