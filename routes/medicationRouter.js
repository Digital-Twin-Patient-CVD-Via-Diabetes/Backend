import express from 'express';
import { createMedication, getMedicationsPatient, updateMedication, deleteMedication, getMedicationsDoctor } from '../controllers/medicationController.js';
import authMiddleware from '../middlewares/authMiddleware.js';


const Medicationrouter = express.Router();
const {authenticateDoctor, authenticatePatient} = authMiddleware;

Medicationrouter.post('/create', authenticateDoctor ,createMedication);

Medicationrouter.get('/patient', authenticatePatient,getMedicationsPatient);

Medicationrouter.put('/update/:medicationId', authenticateDoctor,updateMedication);

Medicationrouter.delete('/delete/:medicationId', authenticateDoctor,deleteMedication);

Medicationrouter.get('/doctor/:patientId', authenticateDoctor,getMedicationsDoctor);

export default Medicationrouter;