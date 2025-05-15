
import rangesModel from '../models/ranges.model.js';
import Patient from '../models/patients.model.js';

export const getRanges = async (req, res) => {
    try {
        const patientId = req.params.patientId;
        const patient = await Patient.findById(patientId);
        if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
        }
        const age = patient.anchorAge;
        const bpAgeGroup = age < 60 ? '18-59' : '60+';
        let ntProBNPGroup;
        if (age < 50) {
        ntProBNPGroup = '<50';
        } else if (age < 75) {
        ntProBNPGroup = '50-75';
        } else {
        ntProBNPGroup = '>75';
        }
        const groupsToInclude = ['All Adults', bpAgeGroup, ntProBNPGroup];
        const metrics = await rangesModel.find({
        ageGroup: { $in: groupsToInclude }
        }).select('healthMetric normalMin normalMax units');
        res.status(200).json(metrics);
        console.log(metrics);
        console.log('patientId:', patientId);
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(error);
    }
};

export const getPatientdage = async (req, res) => {
    try {
        const patientId = req.params.patientId;
        const patient = await Patient.findById(patientId);
        if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
        }
        const age = patient.anchorAge;
        res.status(200).json({ age });
        console.log(patient.anchorAge);
        console.log('patientId:', patientId);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
        console.log(error);
    }};

