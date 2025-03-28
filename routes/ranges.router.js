import express from 'express';
import { getRanges } from '../controllers/Ranges.controller.js';
import { getPatientdage } from '../controllers/Ranges.controller.js';

const RangesRouter = express.Router();


RangesRouter.get('/patient/:patientId', getRanges);
RangesRouter.get('/age/:patientId', getPatientdage);

export default  RangesRouter;