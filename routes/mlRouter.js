
import { Router } from 'express';
import patients from '../models/patients.model.js';
import healthMetrics from '../models/healthmetricsModel.js';
import RiskResult from '../models/riskResult.model.js';
import { fetchHealthRisk,getPatientModeldata ,modelbyid, whatif ,} from '../controllers/mlController.js';
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
      inputValues : {
        gender:              output["Input Values"].gender,
        bloodPressure:        output["Input Values"].BloodPressure,
        age:                  output["Input Values"].age,
        exerciseHoursPerWeek: output["Input Values"]["Exercise Hours Per Week"],
        diet:                 output["Input Values"].Diet,
        sleepHoursPerDay:     output["Input Values"]["Sleep Hours Per Day"],
        stressLevel:          output["Input Values"]["Stress Level"],
        glucose:              output["Input Values"].glucose,
        bmi:                  output["Input Values"].BMI,
        hypertension:         output["Input Values"].hypertension,
        isSmoking:            output["Input Values"].is_smoking,
        hemoglobinA1c:        output["Input Values"].hemoglobin_a1c,
        diabetesPedigree:     output["Input Values"].Diabetes_pedigree,
        cvdFamilyHistory:     output["Input Values"].CVD_Family_History,
        ldValue:              output["Input Values"].ld_value,
        admissionTsh:         output["Input Values"].admission_tsh,
        isAlcoholUser:        output["Input Values"].is_alcohol_user,
        creatineKinaseCk:     output["Input Values"].creatine_kinase_ck
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

mlRouter.post('/whatif',authenticateDoctor,whatif);
mlRouter.get('/risk/:patientId' ,authenticateDoctor,modelbyid);
// mlRouter.get('/model/:patientId', authenticatePatient,LLMModelData);

export default mlRouter;
