import mongoose from 'mongoose';


const patientSchema = new mongoose.Schema({
    
    name: { type: String, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    birthDate: { type: Date, required: true },                
    email: { type: String },                                  
    phoneNumber: { type: String },                           
    address: { type: String },                              
    emergencyContact: { type: String },
    disease: { type: String,enum:['diabetes','cvd','both','none'] },
    anchorAge: { type: Number },
    exerciseHoursPerWeek: { type: Number },
    diet: { type: String, enum: ['Healthy', 'Unhealthy']  },
    sleepHoursPerDay: { type: Number },
    stressLevel: { type: Number, enum: [1, 2, 3, 4, 5] },
    isPregnant: { type: Boolean },
    isAlcoholUser: { type: Boolean },
    diabetesPedigree: { type: Number },
    heightCm: { type: Number },
    admissionWeightKg: { type: Number },
    isSmoker: { type: Boolean },
    admissionSBP: { type: Number },
    admissionDBP: { type: Number },
    admissionSOH: { type: Number },
    ckdFamilyHistory: { type: Boolean },
    password: { type: String, required: true },

}, { timestamps: true });


const patients = mongoose.model('patients', patientSchema);
export default patients;
