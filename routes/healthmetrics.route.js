import express from 'express';
import {getHealthMetrics, createHealthMetrics,healthMetricsHistory, getHealthMetricsPatient} from '../controllers/healthMetrics.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const metricsRouter = express.Router();
const {authenticateDoctor,authenticatePatient} = authMiddleware

metricsRouter.get('/', authenticateDoctor ,getHealthMetrics);

metricsRouter.post('/create',authenticatePatient ,createHealthMetrics);

// metricsRouter.put('/update',authenticateDoctor ,updateHealthMetrics);

metricsRouter.get('/history',authenticateDoctor ,healthMetricsHistory);

metricsRouter.get('/patient',authenticatePatient ,getHealthMetricsPatient);
export default metricsRouter;