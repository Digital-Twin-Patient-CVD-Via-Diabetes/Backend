import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import{ addWearableData} from '../controllers/wearableController.js';

const { authenticateDoctor,authenticatePatient } = authMiddleware;


const wearableRoutes = express.Router();




wearableRoutes.post('/', authenticatePatient, addWearableData);


export default wearableRoutes;
