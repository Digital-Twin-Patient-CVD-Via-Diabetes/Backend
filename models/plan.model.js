import mongoose from 'mongoose';


const mealSchema = new mongoose.Schema({
  day: Number,
  breakfast: {
    item: String,
    grams: Number
  },
  lunch: {
    item: String,
    grams: Number
  },
  dinner: {
    item: String,
    grams: Number
  },
  snacks: [{
    item: String,
    grams: Number
  }]
}, { _id: false });

const exerciseScheduleSchema = new mongoose.Schema({
  day: String,
  activity: String,
  duration_min: Number,
  intensity: String
}, { _id: false });

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
    dailyCaloriesTarget: { type: Number, required: true },
    meals: [mealSchema]
  },
  exercisePlan: {
    typeRecommendations: { type: String, required: true },
    frequencySuggestion: { type: String, required: true },
    weeklySchedule: [exerciseScheduleSchema]
  },
  nutritionTargets: {
    targetBMI: { type: String, required: true },
    targetGlucose: { type: String, required: true },
    cholesterolTargets: { type: String, required: true }
  }
}, {
  timestamps: true
});

const Plan = mongoose.models.Plan || mongoose.model('Plan', planSchema);
export default Plan;