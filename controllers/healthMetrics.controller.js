import { create } from "../models/doctorPatientAssignments.model";
import healthMetrics from "../models/healthmetricsModel.js";
import patients from "../models/patients.model.js";



const getHealthMetrics = async (req, res) => {
    
    try {
        const { patientId } = req.body;
        const healthMetricsData = await healthMetrics.find({ patientId });
        if(healthMetricsData){
           return res.status(200).json({ healthMetricsData });
        }
        return res.status(404).json({ message: "No health metrics found for this patient" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
    
}

const updateHealthMetrics = async (req, res) => {
    try {
        const { patientId, metricDate, bloodPressure, bmi, glucose, cholesterolTotal, cholesterolHDL, cholesterolLDL, albuminCreatineUrine, troponinMedian, hemoglobinA1c, creatineKinaseCK, creatineKinaseMB, medianTriglycerides, medianNtprobnp, medianT3Value, thyroxineFreeLevel } = req.body;

        const findPatient = await patients.findById(patientId);
        if(!findPatient){
            return res.status(404).json({ message: "Patient not found" });
        }

        const findHealthMetrics = await healthMetrics.findOne({ patientId});

        if(findHealthMetrics){

             const updatedHealthMetrics = await healthMetrics.findOneAndUpdate(
            { patientId },
            { 
                $set: {
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
                    updatedDate: Date.now(),
                }
            }
        );

            return res.status(200).json({ message: "Health metrics updated successfully" });

        } else{
            return res.status(404).json({ message: "Health metrics not found for this patient" });
        }
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
        
    }
}

const createHealthMetrics = async (req, res) => {
    try {

        const { patientId, metricDate, bloodPressure, bmi, glucose, cholesterolTotal, cholesterolHDL, cholesterolLDL, albuminCreatineUrine, troponinMedian, hemoglobinA1c, creatineKinaseCK, creatineKinaseMB, medianTriglycerides, medianNtprobnp, medianT3Value, thyroxineFreeLevel } = req.body;

        const findPatient = await patients.findById(patientId);
        if(!findPatient){
            return res.status(404).json({ message: "Patient not found" });
        }

        const findHealthMetrics = await healthMetrics.findOne({ patientId});

        if(findHealthMetrics){

            return res.status(400).json({ message: "Health metrics already exists for this patient" });

        } else{

            const newHealthMetrics = new healthMetrics({
                patientId,
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
                createDate: Date.now(),
            });

            await newHealthMetrics.save();
            return res.status(201).json({ message: "Health metrics created successfully" });
        }
        
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export { getHealthMetrics, updateHealthMetrics, createHealthMetrics };