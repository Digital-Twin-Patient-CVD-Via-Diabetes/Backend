// import { create } from "../models/doctorPatientAssignments.model";
import healthMetrics from "../models/healthmetricsModel.js";
import patients from "../models/patients.model.js";



const getHealthMetrics = async (req, res) => {
    
    try {
        const { patientId } = req.body;
        const healthMetricsData = await healthMetrics.find({ patientId }).sort({ createdAt: -1 }).limit(1);
        if (healthMetricsData.length > 0) {
            return res.status(200).json({ healthMetricsData: healthMetricsData[0] });
        }
        return res.status(404).json({ message: "No health metrics found for this patient" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
    
}

const getHealthMetricsPatient = async (req, res) => {
    try {
        const patientId = req.user.id;
        const healthMetricsData = await healthMetrics.find({ patientId }).sort({ createdAt: -1 });
        return res.status(200).json({ healthMetricsData });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}
// const updateHealthMetrics = async (req, res) => {
//     try {
//         const { patientId, metricDate, bloodPressure, bmi, glucose, cholesterolTotal, cholesterolHDL, cholesterolLDL, albuminCreatineUrine, troponinMedian, hemoglobinA1c, creatineKinaseCK, creatineKinaseMB, medianTriglycerides, medianNtprobnp, medianT3Value, thyroxineFreeLevel } = req.body;

//         const findPatient = await patients.findById(patientId);
//         if(!findPatient){
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         const findHealthMetrics = await healthMetrics.findOne({ patientId});

//         if(findHealthMetrics){

//              const updatedHealthMetrics = await healthMetrics.findOneAndUpdate(
//             { patientId },
//             { 
//                 $set: {
//                     metricDate,
//                     bloodPressure,
//                     bmi,
//                     glucose,
//                     cholesterolTotal,
//                     cholesterolHDL,
//                     cholesterolLDL,
//                     albuminCreatineUrine,
//                     troponinMedian,
//                     hemoglobinA1c,
//                     creatineKinaseCK,
//                     creatineKinaseMB,
//                     medianTriglycerides,
//                     medianNtprobnp,
//                     medianT3Value,
//                     thyroxineFreeLevel,
//                 }
//             }
//         );

//             return res.status(200).json({ message: "Health metrics updated successfully", updatedHealthMetrics });

//         } else{
//             return res.status(404).json({ message: "Health metrics not found for this patient" });
//         }
        
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: "Internal server error" });
        
//     }
// }

const createHealthMetrics = async (req, res) => {
    try {
        const patientId = req.user.id;
        const {
            metricDate,
            bloodPressure,
            bmi,
            glucose,
            cholesterolTotal,
            cholesterolHDL,
            cholesterolLDL,
            albuminCreatineUrine,
            troponinMedian,
            hemoglobinA1c,
            creatineKinaseCK,
            creatineKinaseMB,
            medianTriglycerides,
            medianNtprobnp,
            medianT3Value,
            thyroxineFreeLevel,
        } = req.body;

        
        const findPatient = await patients.findById(patientId);
        if (!findPatient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        const findHealthMetrics = await healthMetrics.findOne({ patientId });

        const updatedHealthMetrics = {
            metricDate: metricDate || findHealthMetrics?.metricDate,
            bloodPressure: bloodPressure || findHealthMetrics?.bloodPressure,
            bmi: bmi || findHealthMetrics?.bmi,
            glucose: glucose || findHealthMetrics?.glucose,
            cholesterolTotal: cholesterolTotal || findHealthMetrics?.cholesterolTotal,
            cholesterolHDL: cholesterolHDL || findHealthMetrics?.cholesterolHDL,
            cholesterolLDL: cholesterolLDL || findHealthMetrics?.cholesterolLDL,
            albuminCreatineUrine: albuminCreatineUrine || findHealthMetrics?.albuminCreatineUrine,
            troponinMedian: troponinMedian || findHealthMetrics?.troponinMedian,
            hemoglobinA1c: hemoglobinA1c || findHealthMetrics?.hemoglobinA1c,
            creatineKinaseCK: creatineKinaseCK || findHealthMetrics?.creatineKinaseCK,
            creatineKinaseMB: creatineKinaseMB || findHealthMetrics?.creatineKinaseMB,
            medianTriglycerides: medianTriglycerides || findHealthMetrics?.medianTriglycerides,
            medianNtprobnp: medianNtprobnp || findHealthMetrics?.medianNtprobnp,
            medianT3Value: medianT3Value || findHealthMetrics?.medianT3Value,
            thyroxineFreeLevel: thyroxineFreeLevel || findHealthMetrics?.thyroxineFreeLevel,
        };

        
        
            const newHealthMetrics = new healthMetrics({
                patientId,
                ...updatedHealthMetrics,
            });

            await newHealthMetrics.save();
            return res.status(201).json({ message: "Health metrics created successfully" });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};


const healthMetricsHistory = async (req, res) => {
    try {
        const { patientId } = req.body;
        const healthMetricsData  = await healthMetrics.find({patientId})
        if (!healthMetricsData) {
            return res.status(404).json({ message: "No health metrics found for this patient" });
        }
       
        return res.status(200).json({ healthMetricsData });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export { getHealthMetrics, createHealthMetrics, healthMetricsHistory, getHealthMetricsPatient };