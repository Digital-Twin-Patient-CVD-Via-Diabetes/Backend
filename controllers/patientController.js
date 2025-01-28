import patients from "../models/patients.model.js";
import doctorPatientAssignment from "../models/doctorPatientAssignments.model.js";
import appointments from "../models/appointments.model.js";
import medications from "../models/medications.model.js";
import healthMetrics from "../models/healthmetricsModel.js";



export const getLinkedPatients = async (req, res) => {
  try {
    const doctorId = req.user._id; 

    
    const assignments = await doctorPatientAssignment.find({ doctorId }).select("patientId");

    const patientIds = assignments.map((assignment) => assignment.patientId);

    
    const linkedPatients = await patients.find({ _id: { $in: patientIds } }).select(
       "_id name gender birthDate email phoneNumber address emergencyContact anchorAge isPregnant isAlcoholUser diabetesPedigree heightCm admissionWeightKg isSmoker admissionSBP admissionDBP admissionSOH ckdFamilyHistory"
    );

    
    const patientDataWithDetails = await Promise.all(
      linkedPatients.map(async (patient) => {
        const patientAppointments = await appointments.find({ patientId: patient._id });
        const patientMedications = await medications.find({ patientId: patient._id });
        const patienthealthMetrics = await healthMetrics.find({ patientId: patient._id });

        return {
          ...patient.toObject(),
          appointments: patientAppointments,
          medications: patientMedications,
          healthMetrics: patienthealthMetrics,
        };
      })
    );

    res.status(200).json(patientDataWithDetails);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve patients", error: error.message });
  }
};
