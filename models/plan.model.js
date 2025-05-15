import mongoose from 'mongoose';


const planSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    ref: 'patients'
  },
  patientRecommendations: {
    type: [String],
    required: true
  },
  dietPlan: {
    description: { type: String, required: true },
    calories: { type: Number, required: true },
    meals: [{ type: String, required: true }]
  },
  exercisePlan: {
    type: {
      type: String,
      required: true
    },
    duration: { type: Number, required: true },
    frequency: { type: Number, required: true }
  },
  nutritionTargets: {
    targetBMI: { type: Number, required: true },
    targetGlucose: { type: Number, required: true },
    targetLDValue: { type: String, required: true }
  }
}, {
  timestamps: true
});


const Plan = mongoose.models.Plan || mongoose.model('Plan', planSchema);
export default Plan;
