
import express from 'express';
import authController from '../controllers/authController.js';

const { login, register, forgetPassword, createNewPassword } = authController;

const authRoutes = express.Router();

authRoutes.post('/login', login);
authRoutes.post('/register', register);
authRoutes.post('/forget-password', forgetPassword);
authRoutes.post('/create-new-password', createNewPassword);
export default  authRoutes;
