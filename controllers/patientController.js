import patients from "../models/patients.model.js";
import doctorPatientAssignment from "../models/doctorPatientAssignments.model.js";
import appointments from "../models/appointments.model.js";
import medications from "../models/medications.model.js";
import healthMetrics from "../models/healthmetricsModel.js";


export const assignPatient = async (req, res) => {
  const { name, gender, birthDate, phoneNumber } = req.body;
  const doctorId = req.user.id; 

  try {
    
    const isDoctor = req.user.userType === "doctor";
    if (!isDoctor) {
      return res.status(403).json({ message: "Only doctors can assign patients." });
    }

    
    let existingPatient = await patients.findOne({ phoneNumber: phoneNumber });

    if (!existingPatient) {
      
      existingPatient = new patients({
        name,
        gender,
        birthDate: birthDate,
        phoneNumber: phoneNumber,
        password: phoneNumber,
        
      });

      
      await existingPatient.save();
    }

    
    

    
    const newAssignment = new doctorPatientAssignment({
      doctorId,
      patientId: existingPatient._id,
      startDate: new Date(),
    });

    
    await newAssignment.save();

    
    res.status(201).json({
      message: "Patient assigned successfully",
      patient: existingPatient,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to assign patient", error: error.message });
  }
};

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
