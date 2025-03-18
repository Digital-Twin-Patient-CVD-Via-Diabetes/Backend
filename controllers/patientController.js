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
        disease: "none",
        email:phoneNumber+"@gmail.com",
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
    
    const doctorId = req.user.id; 
    
    
    const assignments = await doctorPatientAssignment.find({ doctorId }).select("patientId");
    console.log(assignments);
    const patientIds = assignments.map((assignment) => assignment.patientId);

    
    const linkedPatients = await patients.find({ _id: { $in: patientIds } }).select(
       "_id name gender birthDate email phoneNumber address emergencyContact anchorAge isPregnant isAlcoholUser diabetesPedigree heightCm admissionWeightKg isSmoker admissionSBP admissionDBP admissionSOH ckdFamilyHistory disease"
    );
    console.log(linkedPatients);

    
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
    console.log(patientDataWithDetails);
    res.status(200).json(patientDataWithDetails);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve patients", error: error.message });
  }
};

export const getPatientDetails = async (req, res) => {
  try {
    const patientId = req.user.id; 
    console.log(patientId);
    const patient = await patients.findById(patientId).select(
      "_id name gender birthDate email phoneNumber address emergencyContact anchorAge isPregnant isAlcoholUser diabetesPedigree heightCm admissionWeightKg isSmoker admissionSBP admissionDBP admissionSOH ckdFamilyHistory disease"
    );
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.status(200).json(patient); 
  } catch (error) {
    console.error("Error fetching patient details:", error);
    res.status(500).json({ message: "Failed to retrieve patient details", error: error.message });
  }
};


export const updatePatientDetails = async (req, res) => {
  try {
    const patientId = req.user.id; 

    
    const updates = req.body;
    const updatedPatient = await patients.findByIdAndUpdate(patientId, updates, { new: true, runValidators: true });

    if (!updatedPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json(updatedPatient); 
  } catch (error) {
    console.error("Error updating patient details:", error);
    res.status(500).json({ message: "Failed to update patient details", error: error.message });
  }
};

export const deletePatient = async (req, res) => {
  try {
    const patientId = req.user.id; 
    const deletedPatient = await patients.findByIdAndDelete(patientId);

    if (!deletedPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json({ message: "Patient deleted successfully" }); 
  } catch (error) {
    console.error("Error deleting patient:", error);
    res.status(500).json({ message: "Failed to delete patient", error: error.message });
  }
};

export const getPatientById = async (req, res) => {
  try {
    const { patientId } = req.params; 
    
    const patient = await patients.findById(patientId).select(
      "_id name gender birthDate email phoneNumber address emergencyContact anchorAge isPregnant isAlcoholUser diabetesPedigree heightCm admissionWeightKg isSmoker admissionSBP admissionDBP admissionSOH ckdFamilyHistory"
    );

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json(patient);
  } catch (error) {
    console.error("Error fetching patient by ID:", error);
    res.status(500).json({ message: "Failed to retrieve patient", error: error.message });
  }
};