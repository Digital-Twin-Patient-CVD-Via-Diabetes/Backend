
import axios from 'axios';
import dotenv from 'dotenv';
import patients from '../models/patients.model.js';
import RiskResult from '../models/riskResult.model.js';
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
  // Assuming user is already authenticated and `req.user.id` is set
  const patientId = req.user?.id;
  if (!patientId) {
    return res.status(400).json({ error: 'Missing authenticated patient ID' });
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

  // Gender handling
  const genderRaw = inputValues.gender ? inputValues.gender.toLowerCase() : 'male';
  baseUrl = genderRaw === 'male' ? MALE_BN : FEMALE_BN;

  // Define key mapping (camelCase to ML expected format)
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
