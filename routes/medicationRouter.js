import express from 'express';
import { createMedication, getMedications, updateMedication, deleteMedication } from '../controllers/medicationController.js';
import authMiddleware from '../middlewares/authMiddleware.js';


const Medicationrouter = express.Router();
const {authenticateDoctor} = authMiddleware;

Medicationrouter.post('/create', authenticateDoctor ,createMedication);

Medicationrouter.get('/:patientId', authenticateDoctor,getMedications);

Medicationrouter.put('/update/:medicationId', authenticateDoctor,updateMedication);

Medicationrouter.delete('/delete/:medicationId', authenticateDoctor,deleteMedication);

export default Medicationrouter;