import express from 'express';
import {getHealthMetrics, updateHealthMetrics, createHealthMetrics} from '../controllers/healthMetrics.controller.js';

const metricsRouter = express.Router();

metricsRouter.get('/', getHealthMetrics);

metricsRouter.post('/create', createHealthMetrics);

metricsRouter.put('/update', updateHealthMetrics);

export default metricsRouter;