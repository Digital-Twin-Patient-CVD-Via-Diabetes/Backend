import express from 'express';

import { createAppointment, getDoctorAppointments, getPatientAppointments, editAppointment } from '../controllers/appointmentsController.js';

const appointmentsRouter = express.Router();

appointmentsRouter.post('/create', createAppointment);
appointmentsRouter.get('/doctor', getDoctorAppointments);
appointmentsRouter.get('/patient', getPatientAppointments);
appointmentsRouter.put('/edit/:appointmentId', editAppointment);

export default appointmentsRouter;