import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import  { createMedicien, getAllMediciens, deleteMedicien ,getMedicien} from '../controllers/medicienController.js';

const { authenticateDoctor } = authMiddleware;
const medicienRouter = express.Router();

medicienRouter.post('/create', createMedicien);
medicienRouter.get('/get/med/:id', authenticateDoctor, getMedicien);
medicienRouter.get('/all', getAllMediciens);
medicienRouter.delete('/delete/:id', deleteMedicien);

export default medicienRouter;