import mongoose from 'mongoose';

const medicationsSchema = new mongoose.Schema({
    
    patientId: { type: String, required: true, ref: 'patients' },
    doctorId: { type: String, required: true, ref: 'doctors' },
    
    medicationName: { type: String, required: true },
    dosage: { type: String, required: true },
    startDate: { type: Date, required: true },                    
    endDate: { type: Date },                                      
    instructions: { type: String },
   
}, { timestamps: true });

const medications = mongoose.model('medications', medicationsSchema);
export default medications;