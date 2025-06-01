import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/mongodb.js';
import authRoutes from './routes/authRouter.js';
import patientRoutes from './routes/patientRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import wearableRoutes from './routes/wearableRoute.js';
import metricsRouter from './routes/healthmetrics.route.js';
import medicienRouter from './routes/medicienRouter.js';
import Medicationrouter from './routes/medicationRouter.js';
import appointmentsRouter from './routes/appointmentsRoutes.js';
import rangeRouter from './routes/ranges.router.js';
import mlRouter from './routes/mlRouter.js';
import scheduler from './scheduler/risk.js';
import planRouter from './routes/planRouter.js';
scheduler.start();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



dotenv.config();
// app config
const app = express();
const PORT = process.env.PORT || 3000;
connectDB();

// middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);
app.use('/patients', patientRoutes);
app.use('/doctors', doctorRoutes);
app.use('/wearable', wearableRoutes);
app.use('/api/metrics',metricsRouter);
app.use('/api/medicine',medicienRouter);
app.use('/api/medication',Medicationrouter);
app.use('/api/appointment',appointmentsRouter);
app.use('/range',rangeRouter);
app.use('/api/ml',mlRouter);
app.use('/plan',planRouter);

// test route
app.get('/', (req, res) => {
  res.send('Hello World');
});

const arr =["doctor","patient"];
console.log(arr.includes("doctor"));
console.log(arr.includes("patient"));

// listen
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});