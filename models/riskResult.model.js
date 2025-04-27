import mongoose from 'mongoose';

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
  impactInterpretation: { type: String }
}, { timestamps: true });

const RiskResult = mongoose.models.RiskResult ||
  mongoose.model('RiskResult', riskResultSchema);

export default RiskResult;
