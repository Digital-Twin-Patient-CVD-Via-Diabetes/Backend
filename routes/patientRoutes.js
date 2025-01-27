
import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';

const { authenticatePatient } = authMiddleware;
const patientRoutes = express.Router();

patientRoutes.get('/profile', authenticatePatient, (req, res) => {
  res.status(200).json({ message: "Patient profile accessed", user: req.user });
});

export default patientRoutes;
