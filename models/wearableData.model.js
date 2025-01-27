import mongoose from 'mongoose';

const wearableDataSchema = new mongoose.Schema({
    
    patientId: { type: String, required: true, ref: 'patients' }, 
    timestamp: { type: Date, required: true },                  
    heartRate: { type: Number },                                
    steps: { type: Number },                                    
    caloriesBurned: { type: Number },                           
    sleepDuration: { type: Number },                            
    activityLevel: { type: String },                            
}, { timestamps: true }); 

const wearableData = mongoose.model('WearableData', wearableDataSchema);

export default wearableData;