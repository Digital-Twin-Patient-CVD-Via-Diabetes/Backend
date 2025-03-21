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
        if (!patient) return res.status(404).json({ message: "Patient not found" });

        const specialization = patient.disease;
        if (!specialization || specialization === "none") {
            return res.status(406).json({ message: "Specialization not found" });
        }

     const influenceFilter = { influence: "positive" };

        if (specialization === "both") {
            const [medicine1, medicine2] = await Promise.all([
                mediciens.find({ specialization: "diabetes", ...influenceFilter }),
                mediciens.find({ specialization: "cvd", ...influenceFilter })
            ]);
            medicien = [...medicine1, ...medicine2];
           
        } else {
            medicien = await mediciens.find({ specialization });
        }

        return res.status(200).json({ medicien });
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