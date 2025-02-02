import doctors from "../models/doctors.model.js";
import doctorPatientAssignments from "../models/doctorPatientAssignments.model.js";


export const getDoctorForPatient = async (req, res) => {
  try {
    const patientId = req.user.id;
    console.log(patientId);
    
    const assignment = await doctorPatientAssignments
      .find({ patientId })
      .select("doctorId") ;

    console.log(assignment)
    if (!assignment) {
  
      return res.status(404).json({ message: "No assigned doctor found" });
    }

    const doctor = await doctors
      .findById(assignment[assignment.length-1].doctorId)
      .select("_id name specialization email phoneNumber");

      console.log(doctor)
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({ doctor });
  } catch (error) {
    console.error("Error fetching doctor details:", error);
    res.status(500).json({ message: "Failed to retrieve doctor details", error: error.message });
  }
};

export const getDoctorDetails = async (req, res) => {
  try {
    const doctorId = req.user.id;
    console.log(doctorId);
    const doctor = await doctors.findById(doctorId).select(
      "_id name specialization email phoneNumber address"
    );

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json(doctor);
  } catch (error) {
    console.error("Error fetching doctor details:", error);
    res.status(500).json({ message: "Failed to retrieve doctor details", error: error.message });
  }
};

export const updateDoctorDetails = async (req, res) => {
  try {
    const doctorId = req.user.id; 
    console.log(doctorId);

    
    const updates = req.body;  
    const updatedDoctor = await doctors.findByIdAndUpdate(doctorId, updates, { new: true, runValidators: true });

    if (!updatedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json(updatedDoctor);
  } catch (error) {
    console.error("Error updating doctor details:", error);
    res.status(500).json({ message: "Failed to update doctor details", error: error.message });
  }
};

export const deleteDoctor = async (req, res) => {
  try {
    const doctorId = req.user.id;  
    
    const deletedDoctor = await doctors.findByIdAndDelete(doctorId);

    if (!deletedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (error) {
    console.error("Error deleting doctor:", error);
    res.status(500).json({ message: "Failed to delete doctor", error: error.message });
  }
};

