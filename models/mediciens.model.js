import mongoose from "mongoose";

const mediciensSchema = new mongoose.Schema({
    Medication: { type: String, required: true },
    specialization: { type: String, required: true },
    Influence: { type: String, required: true },
}, { timestamps: true });

const mediciens = mongoose.models.mediciens || mongoose.model('mediciens', mediciensSchema);

export default mediciens;
