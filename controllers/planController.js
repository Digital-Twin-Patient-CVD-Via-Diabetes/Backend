import express from 'express';

import TreatmentPlanner from '../treatmentPlan.js';
import Plan from '../models/plan.model.js';
import Patients from '../models/patients.model.js';
import HealthMetrics from '../models/healthmetricsModel.js';
import doctorPatientAssignment from '../models/doctorPatientAssignments.model.js';

const planner = new TreatmentPlanner();

function getAge(birthDate) {
  const diff = Date.now() - new Date(birthDate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
}

function formatPlan(plan) {
  return {
    patientId: plan.patientId,
    nutritionTargets: plan.nutritionTargets,
    specialistPlans: {
      diabetes: plan.diabetesSpecialistVersion.split('\n'),
      cardiology: plan.cardiologySpecialistVersion.split('\n')
    },
    patientPlan: plan.patientVersion.split('\n'),
    generatedAt: new Date()
  };
}

function mapHoursToLevel(hours) {
  if (hours >= 10) return 'very_active';
  if (hours >= 5) return 'active';
  if (hours >= 2) return 'moderate';
  if (hours >= 1) return 'light';
  return 'sedentary';
}

export  async function generatePlan(req, res) {
  try {
    const patientId = req.user.id;
    const patient = await Patients.findById(patientId);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    const latestMetrics = await HealthMetrics.findOne({ patientId })
      .sort({ metricDate: -1 })
      .lean();
    const row = {
      age: getAge(patient.birthDate),
      gender: patient.gender.toLowerCase(),
      weight_kg: patient.admissionWeightKg,
      height_cm: patient.heightCm,
      hypertension: patient.anchorAge > 60 ? 1 : 0,
      diabetes: patient.disease === 'diabetes' || patient.disease === 'both' ? 1 : 0,
      heart_disease: patient.disease === 'cvd' || patient.disease === 'both' ? 1 : 0,
      is_smoking: patient.isSmoker ? 1 : 0,
      is_alcohol_user: patient.isAlcoholUser ? 1 : 0,
      activity_level: mapHoursToLevel(patient.exerciseHoursPerWeek),
      bloodPressure: latestMetrics?.bloodPressure,
      bmi: latestMetrics?.bmi,
      glucose: latestMetrics?.glucose,
      cholesterolTotal: latestMetrics?.cholesterolTotal,
      cholesterolHDL: latestMetrics?.cholesterolHDL,
      cholesterolLDL: latestMetrics?.cholesterolLDL,
      hemoglobinA1c: latestMetrics?.hemoglobinA1c
    };

    const planJson = await planner.planForPatient(patientId, row);
    const formatted = formatPlan(planJson);
    const savedPlan = await Plan.create({
      ...planJson,
      formattedOutput: formatted
    });

    return res.status(201).json(savedPlan);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPlansForDoctor(req, res) {
  try {
    const doctorId = req.user.id;
    const assignments = await doctorPatientAssignment.find({ doctorId }).lean();
    if (!assignments.length) return res.status(404).json({ error: 'No patients found for this doctor' });

    const results = [];
    for (const asg of assignments) {
      const pid = asg.patientId;
      // Try existing plan
      let plan = await Plan.findOne({ patientId: pid }).lean();
      if (!plan) {
        // Generate plan using internal call
        const fakeReq = { user: { id: pid } };
        const planJson = await planner.planForPatient(pid, await buildRow(pid));
        const formatted = formatPlan(planJson);
        plan = await Plan.create({ ...planJson, formattedOutput: formatted });
        plan.formattedOutput = formatted;
      }
      results.push(plan.formattedOutput || plan);
    }
    return res.json(results);
  } catch (err) {
    console.error('Error fetching plans for doctor:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}


async function buildRow(patientId) {
  const patient = await Patients.findById(patientId).lean();
  const latestMetrics = await HealthMetrics.findOne({ patientId }).sort({ metricDate: -1 }).lean();
  return {
    age: getAge(patient.birthDate),
    gender: patient.gender.toLowerCase(),
    weight_kg: patient.admissionWeightKg,
    height_cm: patient.heightCm,
    hypertension: patient.anchorAge > 60 ? 1 : 0,
    diabetes: ['diabetes','both'].includes(patient.disease) ? 1 : 0,
    heart_disease: ['cvd','both'].includes(patient.disease) ? 1 : 0,
    is_smoking: patient.isSmoker ? 1 : 0,
    is_alcohol_user: patient.isAlcoholUser ? 1 : 0,
    activity_level: mapHoursToLevel(patient.exerciseHoursPerWeek),
    bloodPressure: latestMetrics?.bloodPressure,
    bmi: latestMetrics?.bmi,
    glucose: latestMetrics?.glucose,
    cholesterolTotal: latestMetrics?.cholesterolTotal,
    cholesterolHDL: latestMetrics?.cholesterolHDL,
    cholesterolLDL: latestMetrics?.cholesterolLDL,
    hemoglobinA1c: latestMetrics?.hemoglobinA1c
  };
}
