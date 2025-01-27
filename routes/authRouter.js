
import express from 'express';
import authController from '../controllers/authController.js';

const { login, register } = authController;

const authRoutes = express.Router();

authRoutes.post('/login', login);
authRoutes.post('/register', register);

export default  authRoutes;
