const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patientId: { type: String, required: true, ref: 'patients' }, 
    doctorId: { type: String, required: true, ref: 'doctors' },    
    appointmentDate: { type: Date, required: true },               
    purpose: { type: String },                                     
    notes: { type: String },                                       
    status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' }, 
}, { timestamps: true }); 

const appointments = mongoose.model('appointments', appointmentSchema);
module.exports = appointments;
