import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { generatePlan } from '../controllers/planController.js';




const { authenticateDoctor ,authenticatePatient } = authMiddleware;



const planRouter = express.Router();



planRouter.get('/plan',authenticatePatient,generatePlan);
// planRouter.get('/plan',authenticateDoctor,generatePlan);
// planRouter.get('/doctor',authenticateDoctor,getplansforDoctor);

export default planRouter;