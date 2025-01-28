
import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { getLinkedPatients } from '../controllers/patientController.js';
import { assignPatient } from '../controllers/patientController.js';

const { authenticatePatient } = authMiddleware;
const { authenticateDoctor } = authMiddleware;

const patientRoutes = express.Router();

patientRoutes.get('/profile', authenticatePatient, (req, res) => {
  res.status(200).json({ message: "Patient profile accessed", user: req.user });
});

patientRoutes.get("/", authenticateDoctor, getLinkedPatients);
patientRoutes.post("/", authenticateDoctor, assignPatient);

export default patientRoutes;
