import express from 'express';
import {getHealthMetrics, updateHealthMetrics, createHealthMetrics} from '../controllers/healthMetrics.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const metricsRouter = express.Router();
const {authenticateDoctor} = authMiddleware

metricsRouter.get('/', authenticateDoctor ,getHealthMetrics);

metricsRouter.post('/create',authenticateDoctor ,createHealthMetrics);

metricsRouter.put('/update',authenticateDoctor ,updateHealthMetrics);

export default metricsRouter;