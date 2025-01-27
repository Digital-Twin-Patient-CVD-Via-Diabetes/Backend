import mongoose from "mongoose";

const metricsSchema = new mongoose.Schema({
    patientId: {
        type: String,
        required: true,
        ref: "patients"
    },
    metricDate:{
        type: Date,
        
    },
    createDate:{
        type: Date,
    },
    updatedDate:{
        type: Date,
    },
    bloodPressure:{
        type: Number,
    },
    bmi:{
        type: Number,
    },
    glucose:{
        type: Number,
    },
    cholesterolTotal:{
        type: Number,
    },
    cholesterolHDL:{
        type: Number,
    },
    cholesterolLDL:{
        type: Number,
    },
    albuminCreatineUrine:{
        type: Number,
    },
    troponinMedian:{
        type: Number,
    },
    hemoglobinA1c:{
        type: Number,
    },
    creatineKinaseCK:{
        type: Number,
    },
    creatineKinaseMB:{
        type: Number,
    },
    medianTriglycerides:{
        type: Number,
    },
    medianNtprobnp:{
        type: Number,
    },
    medianT3Value:{
        type: Number,
    },
    thyroxineFreeLevel:{
        type: Number,
    }
})

const healthMetrics = mongoose.models.healthMetrics || mongoose.model("healthMetrics", metricsSchema);
export default healthMetrics;