import mongoose from 'mongoose';

const wearableDataSchema = new mongoose.Schema({
    
    patientId: { type: String, required: true, ref: 'patients' }, 
    timestamp: { type: Date, },                  
    steps: { type: Number },                                    
    BloodGlucose: { type: [Number] ,default: [] },                           
    sleepDuration: { type: Number },                            
    BLOODPRESSUREDIASTOLIC: { type: [Number] ,default: [] },
    BLOODPRESSURESYSTOLIC: { type: [Number],default: [] },                            
}, { timestamps: true }); 

const wearableData = mongoose.model('WearableData', wearableDataSchema);

export default wearableData;