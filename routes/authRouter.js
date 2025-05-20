
import express from 'express';
import authController from '../controllers/authController.js';

const { login, register, forgetPassword, createNewPassword,verifyEmail } = authController;

const authRoutes = express.Router();

authRoutes.post('/login', login);
authRoutes.post('/register', register);
authRoutes.get('/verify-email', verifyEmail);
authRoutes.post('/forget-password', forgetPassword);
authRoutes.post('/create-new-password', createNewPassword);
export default  authRoutes;
