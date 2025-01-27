
import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';

const { authenticateDoctor } = authMiddleware;


const doctorRoutes = express.Router();

doctorRoutes.get('/profile', authenticateDoctor, (req, res) => {
  res.status(200).json({ message: "Doctor profile accessed", user: req.user });
});

export default doctorRoutes;
