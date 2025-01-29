import express from 'express';
import  { createMedicien, getAllMediciens, deleteMedicien } from '../controllers/medicienController.js';

const medicienRouter = express.Router();

medicienRouter.post('/create', createMedicien);
medicienRouter.get('/all', getAllMediciens);
medicienRouter.delete('/delete/:id', deleteMedicien);

export default medicienRouter;