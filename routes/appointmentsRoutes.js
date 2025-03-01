import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';

import { createAppointment, getDoctorAppointments, getPatientAppointments, editAppointment, specificDateAppointmentsDoctor } from '../controllers/appointmentsController.js';

const appointmentsRouter = express.Router();
const { authenticateDoctor, authenticatePatient } = authMiddleware;

appointmentsRouter.post('/create', authenticateDoctor ,createAppointment);
appointmentsRouter.get('/doctor', authenticateDoctor,getDoctorAppointments);
appointmentsRouter.get('/patient', authenticatePatient ,getPatientAppointments);
appointmentsRouter.put('/edit', authenticateDoctor ,editAppointment);
appointmentsRouter.get('/doctor/date', authenticateDoctor ,specificDateAppointmentsDoctor);


export default appointmentsRouter; 