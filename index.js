import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/mongodb.js';

dotenv.config();
// app config
const app = express();
const PORT = process.env.PORT || 3000;
connectDB();

// middleware
app.use(express.json());
app.use(cors());

// test route
app.get('/', (req, res) => {
  res.send('Hello World');
});

// listen
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});