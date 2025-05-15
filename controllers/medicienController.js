import { get } from "mongoose";
import mediciens from "../models/mediciens.model.js";
import patients from "../models/patients.model.js";

// Create and Save a new Medicien
const createMedicien = async (req, res) => {
    try {
        const { name, specialization, company } = req.body;
        
        const findMedicien = await mediciens.findOne({ name });
        if (findMedicien) {
            return res.status(400).json({ message: "Medicien already exists" });
        }

        const newMedicien = new mediciens({ name, specialization, company });

        await newMedicien.save();

        res.status(201).json({message: "Medicien created successfully", Medicien: newMedicien});

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Retrieve and return all mediciens from the database.

const getAllMediciens = async (req, res) => {
    try {

        const allMediciens = await mediciens.find();

        res.status(200).json({mediciensList: allMediciens});

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}
const getMedicien = async (req, res) => {
    try {
        const { id } = req.params;
        const patient = await patients.findById(id);
        console.log(patient);

        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        const specialization = patient.disease;
        if (!specialization || specialization === "none") {
            return res.status(406).json({ message: "Specialization not found" });
        }

        const influenceFilter = { influence: "positive" };
        let medicine = [];

        if (specialization === "both") {
            // If the patient has both specializations, find medicines for both
            const [medicine1, medicine2] = await Promise.all([
                mediciens.find({ specialization: "Diabetes", ...influenceFilter }),
                mediciens.find({ specialization: "CVD", ...influenceFilter })
            ]);
            medicine = [...medicine1, ...medicine2];

        } else if (specialization === "diabetes" ) {
            
            medicine = await mediciens.find({ specialization: "Diabetes"});
            console.log(medicine);
        }else{
            medicine = await mediciens.find({ specialization: "CVD"});
            console.log(medicine);
        }

        if (medicine.length === 0) {
            return res.status(404).json({ message: "No medicines found for this specialization" });
        }

        return res.status(200).json({ medicine });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};




// Find a single medicien with an id
// const getMedicien = async (req, res) => {
//     try {
//         const id = req.params.id;

//         const medicien = await mediciens.findById(id);
//         if (!medicien) {
//             return res.status(404).json({ message: "Medicien not found" });
//         }

//         res.status(200).json({medicien});

//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// };

// delete a medicien with the specified id in the request

const deleteMedicien = async (req, res) => {
    try {
        const id = req.params.id;

        const medicien = await mediciens.findByIdAndDelete(id);
        if (!medicien) {
            return res.status(404).json({ message: "Medicien not found" });
        }

        res.status(200).json({ message: "Medicien deleted successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export { createMedicien, getMedicien ,getAllMediciens, deleteMedicien };