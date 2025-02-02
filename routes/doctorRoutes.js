
import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import {getDoctorDetails,deleteDoctor,updateDoctorDetails,getDoctorForPatient} from '../controllers/doctorController.js';


const { authenticateDoctor ,authenticatePatient } = authMiddleware;


const doctorRoutes = express.Router();

doctorRoutes.get('/profile', authenticateDoctor, (req, res) => {
  res.status(200).json({ message: "Doctor profile accessed", user: req.user });
});

doctorRoutes.get('/',authenticateDoctor, getDoctorDetails);
doctorRoutes.put('/', authenticateDoctor,updateDoctorDetails);
doctorRoutes.delete('/', authenticateDoctor,deleteDoctor);
doctorRoutes.get('/patient',authenticatePatient,getDoctorForPatient)


export default doctorRoutes;
