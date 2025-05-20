import mongoose from 'mongoose';


const doctorsSchema = new mongoose.Schema({
    
    name: { type: String, required: true },                  
    specialization: { type: String, required: true },        
    email: { type: String, required: true, unique: true },   
    phoneNumber: { type: String },                           
    address: { type: String },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpires: { type: Date },
}, { timestamps: true });

const doctors = mongoose.model('doctors', doctorsSchema);

export default doctors;