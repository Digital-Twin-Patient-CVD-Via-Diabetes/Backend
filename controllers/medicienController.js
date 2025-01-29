import mediciens from "../models/mediciens.model.js";

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


export { createMedicien, getAllMediciens, deleteMedicien };