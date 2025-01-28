import WearableData from '../models/wearableData.model.js';

import doctorPatientAssignment from "../models/doctorPatientAssignments.model.js";

export const getWearableDataPatient = async (req, res) => {
  try {
    const userId = req.user.id; 
    const role = req.user.userType; 

    let wearableData;
    
    if (role === 'patient') {
      
      wearableData = await WearableData.find({ patientId: userId });
    } else if (role === 'doctor') {
      
      const assignments = await doctorPatientAssignment.find({ doctorId: userId, status: 'Active' }).select('patientId');
      const patientIds = assignments.map((assignment) => assignment.patientId);

      
      wearableData = await WearableData.find({ patientId: { $in: patientIds } });
    } else {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    if (!wearableData || wearableData.length === 0) {
      return res.status(404).json({ message: "No wearable data found" });
    }

    res.status(200).json(wearableData);
  } catch (error) {
    console.error("Error fetching wearable data:", error);
    res.status(500).json({ message: "Failed to retrieve wearable data", error: error.message });
  }
};

export const getWearableDataDoctor = async (req, res) => {
  try {
    const userId = req.user.id; 
    const role = req.user.userType; 

    let wearableData;
    
    if (role === 'doctor') {
      
      const assignments = await doctorPatientAssignment.find({ doctorId: userId, status: 'Active' }).select('patientId');
      const patientIds = assignments.map((assignment) => assignment.patientId);

      
      wearableData = await WearableData.find({ patientId: { $in: patientIds } });
    } else {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    if (!wearableData || wearableData.length === 0) {
      return res.status(404).json({ message: "No wearable data found" });
    }

    res.status(200).json(wearableData);
  } catch (error) {
    console.error("Error fetching wearable data:", error);
    res.status(500).json({ message: "Failed to retrieve wearable data", error: error.message });
  }
};

export const addWearableData = async (req, res) => {
  try {
    const patientId = req.user.id; 
    const { timestamp, heartRate, steps, caloriesBurned, sleepDuration, activityLevel } = req.body;

    
    if (!timestamp) {
      return res.status(400).json({ message: "Timestamp is required" });
    }

    
    const newWearableData = new WearableData({
      patientId,
      timestamp,
      heartRate,
      steps,
      caloriesBurned,
      sleepDuration,
      activityLevel,
    });

    await newWearableData.save();

    res.status(201).json(newWearableData); 
  } catch (error) {
    console.error("Error adding wearable data:", error);
    res.status(500).json({ message: "Failed to add wearable data", error: error.message });
  }
};