import mongoose from 'mongoose';

const doctorPatientAssignmentSchema = new mongoose.Schema({
    
    patientId: { type: String, required: true, ref: 'patients' }, 
    doctorId: { type: String, required: true, ref: 'doctors' },  
    startDate: { type: Date, required: true },                    
    endDate: { type: Date },                                      
    notes: { type: String },                                      
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }, 
}, { timestamps: true }); 

const doctorPatientAssignments = mongoose.model('doctorPatientAssignments', doctorPatientAssignmentSchema);

export default doctorPatientAssignments;