
import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    patientId: { type: String, required: true, ref: 'patients' }, 
    doctorId: { type: String, required: true, ref: 'doctors' },
    doctorName: { type: String, required: true },
    patientName: { type: String, required: true },    
    appointmentDate: { type: String, required: true },  
    appointmentTime: { type: String, required: true },             
    purpose: { type: String },                                     
    notes: { type: String },
    doctorApproval: { type: Boolean, default: false },
    patientApproval: { type: Boolean, default: false },                                       
    status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled','Pending'], default: 'Pending' }, 
}, { timestamps: true }); 

const appointments = mongoose.model('appointments', appointmentSchema);

export default appointments;
