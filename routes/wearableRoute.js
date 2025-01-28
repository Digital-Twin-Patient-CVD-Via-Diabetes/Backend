import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import{getWearableDataPatient ,getWearableDataDoctor, addWearableData} from '../controllers/wearableController.js';

const { authenticateDoctor,authenticatePatient } = authMiddleware;


const wearableRoutes = express.Router();


wearableRoutes.get('/',authenticatePatient , getWearableDataPatient);
wearableRoutes.get('/doctor',authenticateDoctor , getWearableDataDoctor);

wearableRoutes.post('/', authenticatePatient, addWearableData);


export default wearableRoutes;
