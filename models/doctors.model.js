const mongoose = require('mongoose');


const doctorsSchema = new mongoose.Schema({
    
    name: { type: String, required: true },                  
    specialization: { type: String, required: true },        
    email: { type: String, required: true, unique: true },   
    phoneNumber: { type: String },                           
    address: { type: String },
    
}, { timestamps: true });

const doctors = mongoose.model('doctors', doctorsSchema);
module.exports =  doctors;