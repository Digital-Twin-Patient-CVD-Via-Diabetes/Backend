
import axios from 'axios';
import dotenv from 'dotenv';
import patients from '../models/patients.model.js';
import RiskResult from '../models/riskResult.model.js';
import healthMetrics from '../models/healthmetricsModel.js';
import Recommendation from '../models/doctorPlan.model.js';
import doctors from '../models/doctors.model.js';
import Plan from '../models/plan.model.js';
dotenv.config();


const { FEMALE_BN, MALE_BN } = process.env;
const keyMap = {
    BloodPressure:                'Blood_Pressure',
    age:                          'Age',
    'Exercise Hours Per Week':    'Exercise_Hours_Per_Week',
    Diet:                         'Diet',
    'Sleep Hours Per Day':        'Sleep_Hours_Per_Day',
    'Stress Level':               'Stress_Level',
    glucose:                      'glucose',
    BMI:                          'BMI',
    hypertension:                 'hypertension',
    is_smoking:                   'is_smoking',
    hemoglobin_a1c:               'hemoglobin_a1c',
    Diabetes_pedigree:            'Diabetes_pedigree',
    CVD_Family_History:           'CVD_Family_History',
    ld_value:                     'ld_value',
    admission_tsh:                'admission_tsh',
    is_alcohol_user:              'is_alcohol_user',
    creatine_kinase_ck:           'creatine_kinase_ck'
};

function buildMlPayload(inputValues) {
  const payload = {};
  for (const [internalKey, apiKey] of Object.entries(keyMap)) {
    const val = inputValues[internalKey];
    payload[apiKey] = val === undefined ? null : val;
  }
  return payload;
}
function cleanInputValues(inputValues) {
  const cleaned = {};
  for (const key in inputValues) {
    const value = inputValues[key];
    cleaned[key] = value === undefined ? null : value;
  }
  return cleaned;
}

export async function fetchHealthRisk(inputData) {
  const genderRaw = inputData["Input Values"]?.gender;

  if (!genderRaw) throw new Error('Gender not provided');

  const gender = genderRaw.toLowerCase();

  const baseUrl = gender === 'female' ? FEMALE_BN
                 : gender === 'male'   ? MALE_BN
                 : (()=>{ throw new Error('Invalid gender value'); })();

  if (!baseUrl) throw new Error('Base URL missing');

  const mlPayload = buildMlPayload(inputData["Input Values"]);
  console.log('Sending to ML API:', JSON.stringify(mlPayload, null, 2));

  const response = await axios.post(baseUrl, mlPayload, {
    headers: { 'Content-Type': 'application/json' }
  });

  return response.data;
}

export async function getPatientModeldata(req, res) {
  
  const patientId = req.user?.id;
  if (!patientId) {
    return res.status(400).json({ error: 'Missing authenticated patient ID' });
  }
  
  console.log('req.params =', patientId);
  try {
    const patient = await patients.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
      var result = await RiskResult
        .findOne({ patientId })
        .sort({ runDate: -1 });
      
      if (!result) {
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
    }
    result = await RiskResult
    .findOne({ patientId })
    .sort({ runDate: -1 });
    
    return res.json({ data: result });
  } catch (err) {
    console.error('Error fetching patient model data:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function modelbyid(req, res) {
  const patientId = req.params.patientId;
  console.log('req.params =', req.params);

  if (!patientId) {
    return res.status(400).json({ error: 'Missing patientId in request params' });
  }

  try {
    const patient = await patients.findById(patientId);
   
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    const result = await RiskResult
      .findOne({ patientId })
      .sort({ runDate: -1 });
    
    if (!result) {
      return res.status(404).json({ error: 'No health risk data found for this patient' });
    }

    
    return res.json({ data: result });
  } catch (err) {
    console.error('Error fetching patient model data:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}


export async function whatif(req, res) {
  const inputValues = req.body;
  var baseUrl = MALE_BN;

  if (!inputValues) {
    return res.status(400).json({ error: 'Missing inputValues in request' });
  }

  
  const genderRaw = inputValues.gender ? inputValues.gender.toLowerCase() : 'male';
  baseUrl = genderRaw === 'male' ? MALE_BN : FEMALE_BN;

  
  const keyMap = {
    bloodPressure: 'Blood_Pressure',
    age: 'Age',
    exerciseHoursPerWeek: 'Exercise_Hours_Per_Week',
    diet: 'Diet',
    sleepHoursPerDay: 'Sleep_Hours_Per_Day',
    stressLevel: 'Stress_Level',
    glucose: 'glucose',
    bmi: 'BMI',
    hypertension: 'hypertension',
    isSmoking: 'is_smoking',
    hemoglobinA1c: 'hemoglobin_a1c',
    diabetesPedigree: 'Diabetes_pedigree',
    cvdFamilyHistory: 'CVD_Family_History',
    ldValue: 'ld_value',
    admissionTsh: 'admission_tsh',
    isAlcoholUser: 'is_alcohol_user',
    creatineKinaseCk: 'creatine_kinase_ck',
  };

  
  const mlPayload = {};
  for (const [k, v] of Object.entries(keyMap)) {
    mlPayload[v] = inputValues[k] ?? null;
  }

  console.log('Sending to ML API:', JSON.stringify(mlPayload, null, 2));

  try {
    const response = await axios.post(baseUrl, mlPayload, {
      headers: { 'Content-Type': 'application/json' }
    });

    const result = response.data;
    console.log('ML API response:', result);
    return res.json({ data: result });

  } catch (err) {
    console.error('Error fetching patient model data:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}


export async function LLMModelData(req, res) {
  const patientId = req.user?.id;
  if (!patientId) {
    return res.status(400).json({ error: 'Missing authenticated patient ID' });
  }

  try {
    const patient = await patients.findById(patientId).lean();
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    const apiUrl = `https://ai2agent.onrender.com/recommendations/${patientId}?sent_for=0`;
  
    const { data } = await axios.get(apiUrl);
    console.log("AI response:", data);
    const { recommendations } = data;

    const savedPlan = await Plan.findOneAndUpdate(
      { patientId },
      {
        patientId,
        patientRecommendations: recommendations.patient_recommendations,
        dietPlan: {
          description: recommendations.diet_plan.description,
          dailyCaloriesTarget: Number(recommendations.diet_plan.daily_calories?.target || 0),
          meals: recommendations.diet_plan.meals || []
        },
        exercisePlan: {
          typeRecommendations: recommendations.exercise_plan.type_recommendations,
          frequencySuggestion: recommendations.exercise_plan.frequency_recommendations?.suggestion,
          weeklySchedule: recommendations.exercise_plan.weekly_schedule || []
        },
        nutritionTargets: {
          targetBMI: recommendations.nutrition_targets.target_BMI,
          targetGlucose: recommendations.nutrition_targets.target_glucose,
          cholesterolTargets: recommendations.nutrition_targets.other?.cholesterol || "Not specified"
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return res.status(200).json(savedPlan);
  } catch (err) {
    console.error('Error fetching or saving plan:', err);
    if (axios.isAxiosError(err)) {
      const savedPlan = await Plan.findOne({ patientId });
      if (savedPlan) {
        return res.json(savedPlan);
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

const SPECIALTY_SENTFOR_MAP = {
  Cardiology: 1,
  Endocrinology: 2
};

export async function LLMModelDoctorData(req, res) {
  const doctorId = req.user?.id;
  const { patientId } = req.params;

  if (!doctorId) {
    return res.status(400).json({ error: 'Missing authenticated doctor ID' });
  }
  if (!patientId) {
    return res.status(400).json({ error: 'Missing patient ID in request body' });
  }

  try {
    const doctor = await doctors.findById(doctorId).lean();
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const doctorSpecialty = doctor.specialization;
    const sentFor = SPECIALTY_SENTFOR_MAP[doctorSpecialty] || 1;

    const apiUrl = `https://ai2agent.onrender.com/recommendations/${patientId}?sent_for=${sentFor}`;
    const { data } = await axios.get(apiUrl);
    console.log('AI response:', data);
    const { recommendations } = data;

    
    const recDoc = new Recommendation({
      patientId,
      doctorId,
      patient_recommendations: recommendations.patient_recommendations || null,
      diet_plan: recommendations.diet_plan || {},
      exercise_plan: recommendations.exercise_plan || null,
      nutrition_targets: recommendations.nutrition_targets || null,
      doctor_recommendations: recommendations.doctor_recommendations || [],
      medication_recommendations: recommendations.medication_recommendations || [],
      required_labs: recommendations.required_labs || [],
      selected_patient_recommendations: recommendations.selected_patient_recommendations || [],
      current_medications: recommendations.current_medications || []
    });

    await recDoc.save();
    return res.status(200).json(recDoc);
  } catch (err) {
    
    const existingRec = await Recommendation.findOne({ patientId, doctorId });
    if (existingRec) {
        return res.status(200).json(existingRec);
    }
    console.error('Error fetching or saving recommendations:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
