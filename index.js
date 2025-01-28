import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/mongodb.js';
import authRoutes from './routes/authRouter.js';
import patientRoutes from './routes/patientRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import wearableRoutes from './routes/wearableRoute.js';
import metricsRouter from './routes/healthmetrics.route.js';


dotenv.config();
// app config
const app = express();
const PORT = process.env.PORT || 3000;
connectDB();

// middleware
app.use(express.json());
app.use(cors());
app.use('/api/auth', authRoutes);
app.use('/patients', patientRoutes);
app.use('/doctors', doctorRoutes);
app.use('/wearable', wearableRoutes);
app.use('/api/metrics',metricsRouter);

// test route
app.get('/', (req, res) => {
  res.send('Hello World');
});

// listen
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});