import WearableData from '../models/wearableData.model.js';
import patients from '../models/patients.model.js';
import healthMetrics from '../models/healthmetricsModel.js';



// export const getWearableDataPatient = async (req, res) => {
//   try {
//     const userId = req.user.id; 
//     const role = req.user.userType; 

//     let wearableData;
    
//     if (role === 'patient') {
      
//       wearableData = await WearableData.find({ patientId: userId });
//     } else if (role === 'doctor') {
      
//       const assignments = await doctorPatientAssignment.find({ doctorId: userId, status: 'Active' }).select('patientId');
//       const patientIds = assignments.map((assignment) => assignment.patientId);

      
//       wearableData = await WearableData.find({ patientId: { $in: patientIds } });
//     } else {
//       return res.status(403).json({ message: "Unauthorized access" });
//     }

//     if (!wearableData || wearableData.length === 0) {
//       return res.status(404).json({ message: "No wearable data found" });
//     }

//     res.status(200).json(wearableData);
//   } catch (error) {
//     console.error("Error fetching wearable data:", error);
//     res.status(500).json({ message: "Failed to retrieve wearable data", error: error.message });
//   }
// };

// export const getWearableDataDoctor = async (req, res) => {
//   try {
//     const userId = req.user.id; 
//     const role = req.user.userType; 

//     let wearableData;
    
//     if (role === 'doctor') {
      
//       const assignments = await doctorPatientAssignment.find({ doctorId: userId, status: 'Active' }).select('patientId');
//       const patientIds = assignments.map((assignment) => assignment.patientId);

      
//       wearableData = await WearableData.find({ patientId: { $in: patientIds } });
//     } else {
//       return res.status(403).json({ message: "Unauthorized access" });
//     }

//     if (!wearableData || wearableData.length === 0) {
//       return res.status(404).json({ message: "No wearable data found" });
//     }

//     res.status(200).json(wearableData);
//   } catch (error) {
//     console.error("Error fetching wearable data:", error);
//     res.status(500).json({ message: "Failed to retrieve wearable data", error: error.message });
//   }
// };

export const addWearableData = async (req, res) => {
  try {
    const patientId = req.user.id;
    const {
      timestamp,
      BLOODPRESSUREDIASTOLIC,
      BLOODPRESSURESYSTOLIC,
      steps,
      sleepDuration,
      BloodGlucose,
    } = req.body;
    
    const newWearableData = new WearableData({
      patientId,
      timestamp,
      BloodGlucose,
      steps,
      BLOODPRESSUREDIASTOLIC,
      sleepDuration,
      BLOODPRESSURESYSTOLIC,
    });
    await newWearableData.save();

  
    const patient = await patients.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }


    const latestMetric = await healthMetrics
      .findOne({ patientId })
      .sort({ metricDate: -1 });
    if (!latestMetric) {
      return res
        .status(404)
        .json({ message: "No health metrics found for this patient" });
    }


    const newMetric = new healthMetrics({
      patientId,
      metricDate: timestamp,
      bloodPressure: BLOODPRESSURESYSTOLIC,
      glucose: BloodGlucose,
      bmi: latestMetric.bmi,
      cholesterolTotal: latestMetric.cholesterolTotal,
      cholesterolHDL: latestMetric.cholesterolHDL,
      cholesterolLDL: latestMetric.cholesterolLDL,
      albuminCreatineUrine: latestMetric.albuminCreatineUrine,
      troponinMedian: latestMetric.troponinMedian,
      hemoglobinA1c: latestMetric.hemoglobinA1c,
      creatineKinaseCK: latestMetric.creatineKinaseCK,
      creatineKinaseMB: latestMetric.creatineKinaseMB,
    });
    await newMetric.save();
    let updatedPatient;
    if (sleepDuration != null) {
      updatedPatient = await patients.findByIdAndUpdate(
        patientId,
        { $set: { sleepHoursPerDay: sleepDuration } },
        { new: true }
      );
    } else {
      updatedPatient = patient;
    }
    res.status(201).json(newWearableData);
  } catch (error) {
    console.error("Error adding wearable data:", error);
    res
      .status(500)
      .json({ message: "Failed to add wearable data", error: error.message });
  }
};
