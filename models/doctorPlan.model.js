import mongoose from 'mongoose';
const { Schema } = mongoose;

const MedicationRecommendationSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: String },
  rationale: { type: String },
  source: { type: String }
}, { _id: false });

const RequiredLabSchema = new Schema({
  test_name: { type: String, required: true },
  frequency: { type: String, required: true },
  rationale: { type: String },
  urgency: { type: String,  }
}, { _id: false });



const DietPlanSchema = new Schema({
  description: { type: String },
  key_focus: [{ type: String }],
  avoid: [{ type: String }]
}, { _id: false });

const RecommendationSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },

  patient_recommendations: { type: String, default: null },
  diet_plan: DietPlanSchema,
  exercise_plan: { type: String, default: null },
  nutrition_targets: { type: String, default: null },
  doctor_recommendations: [{ type: String }],
  medication_recommendations: [MedicationRecommendationSchema],
  required_labs: [RequiredLabSchema],

  selected_patient_recommendations: [{ type: String }],
}, {
  timestamps: true
});

export default mongoose.model('Recommendation', RecommendationSchema);
