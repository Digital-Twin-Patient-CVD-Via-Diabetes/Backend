import mongoose from 'mongoose';
const { Schema } = mongoose;

const InputValuesSchema = new Schema({
  gender:                 { type: String, required: false },
  bloodPressure:           { type: Number, required: false },
  age:                     { type: Number, required: false },
  exerciseHoursPerWeek:    { type: Number, required: false },
  diet:                    { type: String, required: false },
  sleepHoursPerDay:        { type: Number, required: false },
  stressLevel:             { type: Number, required: false },
  glucose:                 { type: Number, required: false },
  bmi:                     { type: Number, required: false },
  hypertension:            { type: Boolean, required: false },
  isSmoking:               { type: Boolean, required: false },
  hemoglobinA1c:           { type: Number, required: false },
  diabetesPedigree:        { type: Number, required: false },
  cvdFamilyHistory:        { type: Boolean, required: false },
  ldValue:                 { type: Number, required: false },
  admissionTsh:            { type: Number, required: false },
  isAlcoholUser:           { type: Boolean, required: false },
  creatineKinaseCk:        { type: Number, required: false }
}, { _id: false });

const riskResultSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'patients',
    required: true
  },
  runDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  healthRiskProbabilities: {
    diabetes:   { type: String, required: true },
    heartDisease: { type: String, required: true }
  },
  featureImpacts: {
    diabetes: [
      {
        feature: { type: String, required: true },
        impact:  { type: String, required: true }
      }
    ],
    heartDisease: [
      {
        feature: { type: String, required: true },
        impact:  { type: String, required: true }
      }
    ]
  },
  inputValues: {
    type: InputValuesSchema,
  },
  impactInterpretation: { type: String }
}, { timestamps: true });

const RiskResult = mongoose.models.RiskResult ||
  mongoose.model('RiskResult', riskResultSchema);

export default RiskResult;
