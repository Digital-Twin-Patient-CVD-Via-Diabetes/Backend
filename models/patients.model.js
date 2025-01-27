import mongoose from 'mongoose';


const patientSchema = new mongoose.Schema({
    
    name: { type: String, required: true },                   
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true }, 
    birthDate: { type: Date, required: true },                
    email: { type: String },                                  
    phoneNumber: { type: String },                           
    address: { type: String },                              
    emergencyContact: { type: String },                       
    anchorAge: { type: Number },                              
    isPregnant: { type: Boolean },                            
    isAlcoholUser: { type: Boolean },                         
    diabetesPedigree: { type: Number },                       
    heightCm: { type: Number },                              
    admissionWeightKg: { type: Number },                      
    isSmoker: { type: Boolean },                              
    admissionSBP: { type: Number },                           
    admissionDBP: { type: Number },                           
    admissionSOH: { type: String },                           
    ckdFamilyHistory: { type: Boolean },
    password: { type: String, required: true },

}, { timestamps: true });


const patients = mongoose.model('patients', patientSchema);
export default patients;
