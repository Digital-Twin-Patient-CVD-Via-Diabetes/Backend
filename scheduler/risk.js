import cron from 'node-cron';
import { fetchHealthRisk } from '../controllers/mlController.js';
import patients from '../models/patients.model.js';
import healthMetrics from '../models/healthmetricsModel.js';
import RiskResult from '../models/riskResult.model.js';

function computeHypertensionFlag(sbp, dbp) {
  return (sbp >= 140 || dbp >= 90) ? 1 : 0;
}

export default { 
  start() {
    console.log('Scheduler initialized.');
    cron.schedule('0 0 * * 1', async () => {
      console.log('Running weekly ML job:', new Date().toISOString());

      try {
        const allPatients = await patients.find({});

        for (const patient of allPatients) {
          const [latestMetric] = await healthMetrics
            .find({ patientId: patient._id })
            .sort({ metricDate: -1 })
            .limit(1);

          if (!latestMetric) {
            console.log(`No metrics for patient ${patient._id}`);
            continue;
          }

         
          const sbp = patient.admissionSBP ?? latestMetric.bloodPressure;
          const dbp = patient.admissionDBP ?? latestMetric.bloodPressure;
          const hypertension = computeHypertensionFlag(sbp, dbp);

         
          const sampleInput = {
            "Input Values": {
              gender:patient.anchorAge,
              BloodPressure: latestMetric.bloodPressure,
              age:            patient.anchorAge,
              "Exercise Hours Per Week": patient.exerciseHoursPerWeek,
              Diet:           patient.diet,
              "Sleep Hours Per Day":    patient.sleepHoursPerDay,
              "Stress Level":           patient.stressLevel,
              glucose:        latestMetric.glucose,
              BMI:            latestMetric.bmi,
              hypertension,
              is_smoking:     patient.isSmoker,
              hemoglobin_a1c: latestMetric.hemoglobinA1c,
              Diabetes_pedigree:  patient.diabetesPedigree,
              CVD_Family_History: patient.ckdFamilyHistory,
              ld_value:       latestMetric.cholesterolLDL,
              admission_tsh:  latestMetric.thyroxineFreeLevel,
              is_alcohol_user: patient.isAlcoholUser,
              creatine_kinase_ck: latestMetric.creatineKinaseCK
            }
          };
          

          let output;
          try {
            output = await fetchHealthRisk(patient._id,sampleInput);
            console.log(`ML output for patient ${patient._id}:`, output);
          } catch (err) {
            console.error(`ML call failed for patient ${patient._id}:`, err);
            continue;
          }

          try {
            await RiskResult.create({
              patientId: patient._id,
              healthRiskProbabilities: {
                diabetes:     output["Health Risk Probabilities"].Diabetes,
                heartDisease: output["Health Risk Probabilities"]["Heart Disease"]
              },
              featureImpacts: {
                diabetes:     output["Feature Impacts"].diabetes,
                heartDisease: output["Feature Impacts"].heart_disease
              },
              impactInterpretation: output["Impact Interpretation"]
            });
            console.log(`Saved RiskResult for patient ${patient._id}`);
          } catch (err) {
            console.error(`Failed to save RiskResult for patient ${patient._id}:`, err);
          }
        }
      } catch (err) {
        console.error('Weekly ML job failed altogether:', err);
      }
    });
  }
};
