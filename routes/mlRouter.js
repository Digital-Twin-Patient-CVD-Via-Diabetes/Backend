
import { Router } from 'express';
import patients from '../models/patients.model.js';
import healthMetrics from '../models/healthmetricsModel.js';
import RiskResult from '../models/riskResult.model.js';
import { fetchHealthRisk,getPatientModeldata ,modelbyid } from '../controllers/mlController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { model } from 'mongoose';


const { authenticatePatient ,authenticateDoctor} = authMiddleware;
const mlRouter = Router();

function cleanInputValues(inputValues) {
  const cleaned = {};
  for (const key in inputValues) {
    const value = inputValues[key];
    cleaned[key] = value === undefined ? null : value;
  }
  return cleaned;
}
mlRouter.get('/riskresult',authenticatePatient, getPatientModeldata)

mlRouter.post('/healthrisk', authenticatePatient,async (req, res) => {
  const patientId = req.user.id;
  if (!patientId) {
    return res.status(400).json({ error: 'Missing patientId in request body' });
  }

  try {
   
    const patient = await patients.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    
    const [latestMetric] = await healthMetrics
      .find({ patientId })
      .sort({ metricDate: -1 })
      .limit(1);

    if (!latestMetric) {
      return res.status(404).json({ error: 'No health metrics found for this patient' });
    }

    
    const sbp = patient.admissionSBP || latestMetric.bloodPressure;
    const dbp = patient.admissionDBP || latestMetric.bloodPressure;
    const hypertension = (sbp >= 140 || dbp >= 90) ? 1 : 0;

      const mlPayload = {
      "Input Values": cleanInputValues({
        gender: patient.gender?.toLowerCase(),
        age: patient.anchorAge,
        is_smoking: patient.isSmoker,
        is_alcohol_user: patient.isAlcoholUser,
        CVD_Family_History: patient.ckdFamilyHistory,
        BloodPressure: latestMetric.bloodPressure,
        glucose: latestMetric.glucose,
        BMI: latestMetric.bmi,
        hemoglobin_a1c: latestMetric.hemoglobinA1c,
        creatine_kinase_ck: latestMetric.creatineKinaseCK,
        ld_value: latestMetric.cholesterolLDL,
        admission_tsh: latestMetric.thyroxineFreeLevel,
        "Exercise Hours Per Week": patient.exerciseHoursPerWeek,
        Diet: patient.diet,
        "Sleep Hours Per Day": patient.sleepHoursPerDay,
        "Stress Level": patient.stressLevel,
        hypertension: hypertension,
        Diabetes_pedigree: patient.diabetesPedigree
      })
    };
    console.log("ML Payload:", mlPayload);
    const output = await fetchHealthRisk(mlPayload);

    const savedResult = await RiskResult.create({
      patientId: patient._id,
      healthRiskProbabilities: {
        diabetes:     output["Health Risk Probabilities"].Diabetes,
        heartDisease: output["Health Risk Probabilities"]["Heart Disease"]
      },
      featureImpacts: {
        diabetes:     output["Feature Impacts"].diabetes,
        heartDisease: output["Feature Impacts"].heart_disease
      },
      inputValues:{
        bloodPressure:           latestMetric.bloodPressure,
        age:                     patient.anchorAge,
        exerciseHoursPerWeek:    patient.exerciseHoursPerWeek,
        diet:                    patient.diet,
        sleepHoursPerDay:        patient.sleepHoursPerDay,
        stressLevel:             patient.stressLevel,
        glucose:                 latestMetric.glucose,
        bmi:                     latestMetric.bmi,
        hypertension:            hypertension,
        isSmoking:               patient.isSmoker,
        hemoglobinA1c:           latestMetric.hemoglobinA1c,
        diabetesPedigree:        patient.diabetesPedigree,
        cvdFamilyHistory:        patient.ckdFamilyHistory,
        ldValue:                 latestMetric.cholesterolLDL,
        admissionTsh:            latestMetric.thyroxineFreeLevel,
        isAlcoholUser:           patient.isAlcoholUser,
        creatineKinaseCk:        latestMetric.creatineKinaseCK
      },
      impactInterpretation: output["Impact Interpretation"]
    });

    
    res.status(201).json({
      message: 'Risk analysis completed and saved successfully',
      riskResult: savedResult,
      rawOutput: output
    });

  } catch (err) {
    console.error('Error in /healthrisk:', err);
    res.status(500).json({ error: 'Failed to process health risk' });
  }
});

mlRouter.get('/risk/:patientId' ,authenticateDoctor,modelbyid)

export default mlRouter;
