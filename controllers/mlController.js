
import axios from 'axios';
import dotenv from 'dotenv';
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
