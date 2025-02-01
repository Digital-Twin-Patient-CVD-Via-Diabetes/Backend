import medications from "../models/medications.model.js";
import patients from "../models/patients.model.js";
import doctors from "../models/doctors.model.js";
// import doctorPatientAssignments from "../models/doctorPatientAssignments.model.js";
// Create and Save a new Medication

const createMedication = async (req, res) => {
    try {
        const {patientId, doctorId,medicationName ,dosage, startDate, endDate, instructions} = req.body;

        const patient = await patients.findById(patientId);
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        const doctor = await doctors.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        // const doctorPatientAssignment = await doctorPatientAssignments.findOne({ patientId, doctorId });
        // if (!doctorPatientAssignment) {
        //     return res.status(404).json({ message: "Doctor not assigned for this patient" });
        // }

        const findMedication = await medications.findOne({ patientId, doctorId, medicineId, medicationName, dosage, startDate });
        if (findMedication) {
            return res.status(400).json({ message: "Medication already exists" });
        }
        
        
        const medication = new medications({
            patientId,
            doctorId,
            medicineId,
            medicationName,
            dosage,
            startDate,
            endDate,
            instructions
        });

        await medication.save();
        res.status(201).json({ message: "Medication created successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Retrieve Medications for a patient from the database.
const getMedications = async (req, res) => {
    try {
        const patientId = req.params.patientId;
        const patient = await patients.findById(patientId);
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }
        const patientMedications = patient.medications;
        if (patientMedications.length === 0) {
            return res.status(404).json({ message: "No medications found" });
        }
        res.status(200).json(patientMedications);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// update a medication identified by the medicationId in the request

const updateMedication = async (req, res) => {
    try{
        const medicationId = req.params.medicationId;
        const { dosage, startDate, endDate, instructions } = req.body;
        
        const updatedMedication= await medications.findByIdAndUpdate(medicationId,{
             $set :
             { dosage, startDate, endDate, instructions }
            },{new:true, upsert:false});
        
        if(!updatedMedication){
            return res.status(404).json({ message: "Medication not found" });
        }
        res.status(200).json({ message: "Medication updated successfully", medication: updatedMedication });

    }catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }

}

// Delete a medication with the specified medicationId in the request

const deleteMedication = async (req, res) => {
    try {
        const medicationId = req.params.medicationId;
        const medication = await medications.findByIdAndDelete(medicationId);
        if (!medication) {
            return res.status(404).json({ message: "Medication not found" });
        }
        res.status(200).json({ message: "Medication deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export { createMedication, getMedications, updateMedication, deleteMedication };