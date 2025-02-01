import express from 'express';

import { createAppointment, getDoctorAppointments } from '../controllers/appointmentsController.js';

const appointmentsRouter = express.Router();

appointmentsRouter.post('/create', createAppointment);
appointmentsRouter.get('/doctor', getDoctorAppointments);

export default appointmentsRouter;